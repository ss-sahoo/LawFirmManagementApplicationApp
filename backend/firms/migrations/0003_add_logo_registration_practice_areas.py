# Generated manually on 2026-04-15

from django.db import migrations, models


def check_and_add_fields(apps, schema_editor):
    """Add fields only if they don't exist"""
    from django.db import connection
    
    # Get the table description to check existing columns
    with connection.cursor() as cursor:
        # Get existing columns in a database-agnostic way
        cursor.execute("SELECT * FROM firms_firm LIMIT 0")
        existing_columns = [col[0] for col in cursor.description]
        
        # Add logo if it doesn't exist
        if 'logo' not in existing_columns:
            if connection.vendor == 'postgresql':
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN logo VARCHAR(100) NULL")
            else:
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN logo VARCHAR(100)")
        
        # Add registration_number if it doesn't exist
        if 'registration_number' not in existing_columns:
            if connection.vendor == 'postgresql':
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN registration_number VARCHAR(100) DEFAULT '' NOT NULL")
                cursor.execute("ALTER TABLE firms_firm ALTER COLUMN registration_number DROP DEFAULT")
            else:
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN registration_number VARCHAR(100) NOT NULL DEFAULT ''")
        
        # Add practice_areas if it doesn't exist
        if 'practice_areas' not in existing_columns:
            if connection.vendor == 'postgresql':
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN practice_areas JSONB DEFAULT '[]' NOT NULL")
            else:
                # SQLite uses TEXT for JSON fields
                cursor.execute("ALTER TABLE firms_firm ADD COLUMN practice_areas TEXT NOT NULL DEFAULT '[]'")


class Migration(migrations.Migration):
    dependencies = [
        ("firms", "0002_branch"),
    ]

    operations = [
        migrations.RunPython(check_and_add_fields, migrations.RunPython.noop),
    ]
