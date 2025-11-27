"""
Migrate CSV data to PostgreSQL database

Usage:
    python migrate_csv_to_db.py

This script:
1. Reads rfm_table.csv
2. Creates database tables
3. Loads all customer RFM data into PostgreSQL
4. Handles duplicates gracefully
"""
import os
import sys
import pandas as pd
from sqlalchemy.exc import IntegrityError
from database import init_db, get_db, CustomerRFM, db_available

# Paths
CSV_PATH = os.getenv("RFM_CSV_PATH", "models/rfm_table.csv")


def migrate_csv_to_database():
    """
    Load CSV data into PostgreSQL database
    """
    if not db_available:
        print("❌ Database not available. Check your DATABASE_URL in .env")
        sys.exit(1)
    
    print("🚀 Starting CSV to PostgreSQL migration...")
    
    # Step 1: Create tables
    print("📋 Creating database tables...")
    init_db()
    
    # Step 2: Read CSV
    print(f"📂 Reading CSV file: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print(f"❌ CSV file not found: {CSV_PATH}")
        sys.exit(1)
    
    df = pd.read_csv(CSV_PATH)
    print(f"✅ Loaded {len(df)} customer records from CSV")
    
    # Step 3: Validate columns
    required_cols = {'CustomerID', 'Recency', 'Frequency', 'Monetary'}
    if not required_cols.issubset(df.columns):
        print(f"❌ CSV missing required columns. Expected: {required_cols}")
        print(f"   Found: {set(df.columns)}")
        sys.exit(1)
    
    # Step 4: Load data into database
    print("💾 Inserting data into PostgreSQL...")
    db = get_db()
    
    if not db:
        print("❌ Failed to get database session")
        sys.exit(1)
    
    inserted = 0
    skipped = 0
    errors = 0
    
    for idx, row in df.iterrows():
        try:
            customer = CustomerRFM(
                customer_id=float(row['CustomerID']),
                recency=float(row['Recency']),
                frequency=float(row['Frequency']),
                monetary=float(row['Monetary'])
            )
            db.add(customer)
            db.commit()
            inserted += 1
            
            if (idx + 1) % 500 == 0:
                print(f"   Progress: {idx + 1}/{len(df)} records processed...")
                
        except IntegrityError:
            # Duplicate customer_id
            db.rollback()
            skipped += 1
        except Exception as e:
            db.rollback()
            errors += 1
            if errors < 5:  # Only print first 5 errors
                print(f"⚠️ Error at row {idx}: {e}")
    
    db.close()
    
    # Step 5: Summary
    print("\n" + "="*60)
    print("✅ MIGRATION COMPLETE")
    print("="*60)
    print(f"📊 Total records in CSV: {len(df)}")
    print(f"✅ Successfully inserted: {inserted}")
    print(f"⏭️ Skipped (duplicates): {skipped}")
    print(f"❌ Errors: {errors}")
    print("="*60)
    
    # Step 6: Verify
    print("\n🔍 Verifying database...")
    db = get_db()
    count = db.query(CustomerRFM).count()
    db.close()
    print(f"✅ Database now contains {count} customer records")
    
    return inserted, skipped, errors


if __name__ == "__main__":
    print("="*60)
    print("CSV to PostgreSQL Migration Tool")
    print("="*60)
    
    try:
        migrate_csv_to_database()
        print("\n✅ Migration successful! You can now deploy the API with database support.")
    except KeyboardInterrupt:
        print("\n⚠️ Migration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
