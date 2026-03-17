import sqlite3
import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
DB_PATH = '/app/incoming_files/gsm_extracted/gsm.db'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def supabase_insert(table, records, chunk_size=500):
    total = len(records)
    inserted = 0
    for i in range(0, total, chunk_size):
        chunk = records[i:i+chunk_size]
        req = urllib.request.Request(
            f'{SUPABASE_URL}/rest/v1/{table}',
            data=json.dumps(chunk).encode(),
            headers={**HEADERS, 'Prefer': 'return=minimal,resolution=ignore-duplicates'},
            method='POST'
        )
        try:
            res = urllib.request.urlopen(req)
            inserted += len(chunk)
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f'  ❌ Error inserting into {table}: {body[:300]}')
            return inserted
    return inserted

def supabase_select(table, select='*', filters=None):
    params = f'select={select}'
    if filters:
        params += '&' + '&'.join(f'{k}=eq.{v}' for k, v in filters.items())
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/{table}?{params}',
        headers={**HEADERS, 'Prefer': 'return=representation'}
    )
    try:
        res = urllib.request.urlopen(req)
        return json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        print(f'Error selecting from {table}: {e.read().decode()[:200]}')
        return []

def clean_company_name(raw_name):
    # Remove trailing device counts like "113 devices", "25 devices"
    cleaned = re.sub(r'\d+\s*devices?\s*$', '', raw_name, flags=re.IGNORECASE).strip()
    return cleaned

def make_slug(text):
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug

def extract_year(announced_value):
    if not announced_value:
        return None
    match = re.search(r'\b(20\d{2})\b', announced_value)
    return int(match.group(1)) if match else None

def run():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # ── Step 1: Migrate Companies ──────────────────────────────────────────────
    print('\n📦 Migrating Companies...')
    cursor.execute('SELECT * FROM Companies')
    raw_companies = cursor.fetchall()

    company_records = []
    slug_counts = {}
    for c in raw_companies:
        name = clean_company_name(c['Name'])
        base_slug = make_slug(name)
        # Handle duplicate slugs
        if base_slug in slug_counts:
            slug_counts[base_slug] += 1
            slug = f'{base_slug}-{slug_counts[base_slug]}'
        else:
            slug_counts[base_slug] = 0
            slug = base_slug

        company_records.append({
            'id': c['Id'],
            'name': name,
            'slug': slug,
            'url': c['Url']
        })

    n = supabase_insert('companies', company_records)
    print(f'  ✅ {n} companies inserted')

    # ── Step 2: Migrate Devices ────────────────────────────────────────────────
    print('\n📱 Migrating Devices...')
    cursor.execute('SELECT * FROM Devices')
    raw_devices = cursor.fetchall()

    # Get announced years from specs
    cursor.execute("SELECT DeviceId, SpecValue FROM Specifications WHERE SpecName='Announced'")
    announced_map = {row['DeviceId']: extract_year(row['SpecValue']) for row in cursor.fetchall()}

    device_records = []
    slug_counts = {}
    for d in raw_devices:
        base_slug = make_slug(d['Name'])
        # Make slug unique by appending device id if needed
        slug = f'{base_slug}-{d["Id"]}'

        device_records.append({
            'id': d['Id'],
            'company_id': d['CompanyId'],
            'name': d['Name'],
            'slug': slug,
            'url': d['Url'],
            'image_url': d['ImageUrl'],
            'announced_year': announced_map.get(d['Id']),
            'is_extracted': bool(d['IsExtracted'])
        })

    n = supabase_insert('devices', device_records, chunk_size=200)
    print(f'  ✅ {n} devices inserted')

    # ── Step 3: Migrate Specifications ────────────────────────────────────────
    print('\n🔧 Migrating Specifications (149k rows, this will take a moment)...')
    cursor.execute('SELECT * FROM Specifications')
    raw_specs = cursor.fetchall()

    # Define category mapping based on spec names
    CATEGORY_MAP = {
        'Technology': 'Network', '2G bands': 'Network', '3G bands': 'Network',
        '4G bands': 'Network', '5G bands': 'Network', 'Speed': 'Network',
        'GPRS': 'Network', 'EDGE': 'Network',
        'Announced': 'Launch', 'Status': 'Launch',
        'Dimensions': 'Body', 'Weight': 'Body', 'Build': 'Body', 'SIM': 'Body',
        'Type': 'Display', 'Size': 'Display', 'Resolution': 'Display',
        'Protection': 'Display',
        'OS': 'Platform', 'Chipset': 'Platform', 'CPU': 'Platform', 'GPU': 'Platform',
        'Card slot': 'Memory', 'Internal': 'Memory',
        'Triple': 'Main Camera', 'Dual': 'Main Camera', 'Single': 'Main Camera',
        'Quad': 'Main Camera', 'Features': 'Main Camera', 'Video': 'Main Camera',
        'Loudspeaker': 'Sound', '3.5mm jack': 'Sound',
        'WLAN': 'Comms', 'Bluetooth': 'Comms', 'Positioning': 'Comms',
        'NFC': 'Comms', 'Radio': 'Comms', 'USB': 'Comms', 'Infrared port': 'Comms',
        'Sensors': 'Features',
        'Colors': 'Misc', 'Models': 'Misc', 'SAR': 'Misc',
        'Charging': 'Battery', 'Battery': 'Battery',
        'Performance': 'Tests', 'Display': 'Tests', 'Camera': 'Tests',
        'Loudspeaker': 'Tests', 'Battery (old)': 'Battery',
    }

    spec_records = []
    for s in raw_specs:
        spec_name = s['SpecName'] if s['SpecName'] else ''
        category = CATEGORY_MAP.get(spec_name, 'Misc')
        # Clean &nbsp; spec names
        clean_name = spec_name.replace('&nbsp;', '').strip()

        spec_records.append({
            'id': s['Id'],
            'device_id': s['DeviceId'],
            'category': category,
            'spec_name': clean_name,
            'spec_value': s['SpecValue']
        })

    n = supabase_insert('specifications', spec_records, chunk_size=1000)
    print(f'  ✅ {n} specifications inserted')

    conn.close()

    print('\n🎉 Migration complete!')
    print(f'  Companies : {len(company_records)}')
    print(f'  Devices   : {len(device_records)}')
    print(f'  Specs     : {len(spec_records)}')

if __name__ == '__main__':
    run()
