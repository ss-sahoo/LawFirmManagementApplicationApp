# Generated manually on 2026-04-15

from django.db import migrations, models


def check_and_add_fields(apps, schema_editor):
    """Add fields only if they don't exist"""
    from django.db import connection
    
    with connection.cursor() as cursor:
        # Check which columns exist
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='firms_firm' 
            AND column_name IN ('logo', 'registration_number', 'practice_areas')
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
        # Add logo if it doesn't exist
        if 'logo' not in existing_columns:
            cursor.execute("""
                ALTER TABLE firms_firm 
                ADD COLUMN logo VARCHAR(100) NULL
            """)
        
        # Add registration_number if it doesn't exist
        if 'registration_number' not in existing_columns:
            cursor.execute("""
                ALTER TABLE firms_firm 
                ADD COLUMN registration_number VARCHAR(100) DEFAULT '' NOT NULL
            """)
            cursor.execute("""
                ALTER TABLE firms_firm 
                ALTER COLUMN registration_number DROP DEFAULT
            """)
        
        # Add practice_areas if it doesn't exist
        if 'practice_areas' not in existing_columns:
            cursor.execute("""
                ALTER TABLE firms_firm 
                ADD COLUMN practice_areas JSONB DEFAULT '[]' NOT NULL
            """)


class Migration(migrations.Migration):
    dependencies = [
        ("firms", "0002_branch"),
    ]

    operations = [
        migrations.RunPython(check_and_add_fields, migrations.RunPython.noop),
    ]
