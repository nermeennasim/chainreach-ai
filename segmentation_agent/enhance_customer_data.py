"""
Enhance RFM data with realistic customer profile fields

This script:
1. Reads existing rfm_table.csv
2. Adds realistic fields: name, email, phone, signup_date, category preferences, engagement metrics
3. Saves enhanced data to rfm_table_enhanced.csv
4. Backs up original to rfm_table_backup.csv
"""
import csv
import random
from datetime import datetime, timedelta
import os
import shutil

# Seed for reproducibility
random.seed(42)

# Load existing RFM data
print("📂 Loading existing RFM data...")
customers = []
with open('models/rfm_table.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        customers.append(row)
print(f"✅ Loaded {len(customers)} customers")

# Realistic data generators
FIRST_NAMES = ["Sarah", "Michael", "Jennifer", "David", "Emily", "James", "Jessica", "Robert", 
               "Lisa", "John", "Amy", "Daniel", "Michelle", "Christopher", "Ashley", "Matthew",
               "Amanda", "Joshua", "Melissa", "Andrew", "Stephanie", "Kevin", "Nicole", "Brian",
               "Rachel", "William", "Laura", "Ryan", "Elizabeth", "Justin", "Rebecca", "Brandon",
               "Samantha", "Jason", "Maria", "Tyler", "Kimberly", "Eric", "Heather", "Jacob"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
              "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
              "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
              "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"]

CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Sports & Outdoors", "Books", 
              "Beauty & Personal Care", "Toys & Games", "Automotive", "Health & Wellness",
              "Food & Beverage", "Office Supplies", "Pet Supplies"]

CHANNELS = ["Email", "SMS", "Push", "Email + SMS"]

def generate_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_email(name, customer_id):
    first, last = name.lower().split()
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com"]
    return f"{first}.{last}{int(customer_id % 1000)}@{random.choice(domains)}"

def generate_phone():
    return f"+1-{random.randint(200,999)}-{random.randint(200,999)}-{random.randint(1000,9999)}"

def calculate_signup_date(recency, frequency):
    # Customers with higher frequency have been around longer
    days_ago = recency + (frequency * 30) + random.randint(0, 90)
    return (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')

def calculate_last_purchase_date(recency):
    return (datetime.now() - timedelta(days=int(recency))).strftime('%Y-%m-%d')

def generate_engagement_metrics(frequency, monetary):
    # More frequent buyers have higher engagement
    base_opens = frequency * random.randint(2, 5)
    email_opens = min(base_opens + random.randint(0, 10), 100)
    email_clicks = int(email_opens * random.uniform(0.2, 0.4))
    campaign_responses = int(frequency * random.uniform(0.3, 0.7))
    return email_opens, email_clicks, campaign_responses

def calculate_average_order_value(monetary, frequency):
    if frequency > 0:
        return round(monetary / frequency, 2)
    return 0

def is_churned(recency):
    return recency > 180  # 6 months

def calculate_risk_score(recency, frequency, monetary):
    # Higher recency = higher risk, higher frequency/monetary = lower risk
    risk = min(100, max(0, int((recency / 3.74) - (frequency * 2) - (monetary / 500))))
    return max(0, min(100, risk))

def calculate_lifetime_value(monetary, frequency):
    # Simple LTV: current spending + projected future
    return round(monetary + (frequency * 200), 2)

print("\n🔧 Generating enhanced customer data...")

# Add new columns
enhanced_data = []

for idx, row in enumerate(customers):
    customer_id = int(float(row['CustomerID']))
    recency = float(row['Recency'])
    frequency = float(row['Frequency'])
    monetary = float(row['Monetary'])
    
    # Generate name
    name = generate_name()
    
    # Generate contact info
    email = generate_email(name, customer_id)
    phone = generate_phone()
    
    # Generate dates
    signup_date = calculate_signup_date(recency, frequency)
    last_purchase_date = calculate_last_purchase_date(recency)
    
    # Generate preferences
    favorite_category = random.choice(CATEGORIES)
    preferred_channel = random.choice(CHANNELS)
    
    # Generate engagement metrics
    email_opens, email_clicks, campaign_responses = generate_engagement_metrics(frequency, monetary)
    
    # Calculate derived metrics
    avg_order_value = calculate_average_order_value(monetary, frequency)
    churned = is_churned(recency)
    risk_score = calculate_risk_score(recency, frequency, monetary)
    lifetime_value = calculate_lifetime_value(monetary, frequency)
    
    enhanced_data.append({
        'CustomerID': customer_id,
        'customer_name': name,
        'email': email,
        'phone': phone,
        'signup_date': signup_date,
        'last_purchase_date': last_purchase_date,
        'Recency': recency,
        'Frequency': frequency,
        'Monetary': monetary,
        'favorite_category': favorite_category,
        'preferred_channel': preferred_channel,
        'email_opens': email_opens,
        'email_clicks': email_clicks,
        'campaign_responses': campaign_responses,
        'average_order_value': avg_order_value,
        'is_churned': churned,
        'risk_score': risk_score,
        'lifetime_value': lifetime_value
    })
    
    if (idx + 1) % 500 == 0:
        print(f"   Processed {idx + 1}/{len(customers)} customers...")

# Backup original
print("\n💾 Backing up original data...")
shutil.copy2('models/rfm_table.csv', 'models/rfm_table_backup.csv')

# Save enhanced data
print("💾 Saving enhanced data...")
fieldnames = list(enhanced_data[0].keys())

with open('models/rfm_table.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(enhanced_data)

# Also save a copy with _enhanced suffix
with open('models/rfm_table_enhanced.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(enhanced_data)

print("\n" + "="*60)
print("✅ DATA ENHANCEMENT COMPLETE!")
print("="*60)
print(f"📊 Total customers: {len(enhanced_data)}")
print(f"📋 Total fields: {len(fieldnames)}")
print("\n📁 Files:")
print(f"   ✅ models/rfm_table.csv (ENHANCED - used by API)")
print(f"   ✅ models/rfm_table_enhanced.csv (copy)")
print(f"   ✅ models/rfm_table_backup.csv (original)")
print("\n📊 New fields added:")
print("   • customer_name, email, phone")
print("   • signup_date, last_purchase_date")
print("   • favorite_category, preferred_channel")
print("   • email_opens, email_clicks, campaign_responses")
print("   • average_order_value, is_churned, risk_score, lifetime_value")
print("\n🔍 Sample enhanced customer (first 5 fields):")
sample = enhanced_data[0]
for key in list(sample.keys())[:5]:
    print(f"   {key}: {sample[key]}")
print("\n✅ Ready to deploy to Azure!")
