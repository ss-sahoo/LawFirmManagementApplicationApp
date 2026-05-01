from django.db import migrations


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model('subscriptions', 'SubscriptionPlan')

    plans = [
        {
            'name': 'Trial',
            'plan_type': 'basic',
            'description': 'Perfect to explore and test the platform features.',
            'price': '0.00',
            'billing_cycle': 'monthly',
            'max_advocates': 1,
            'max_paralegals': 1,
            'max_admins': 1,
            'max_users': 3,
            'max_clients': 5,
            'max_cases': 10,
            'max_storage_gb': 1,
            'max_branches': 1,
            'enable_billing': False,
            'enable_calendar': True,
            'enable_documents': True,
            'enable_reports': False,
            'enable_api_access': False,
            'features': {
                'automated_billing': False,
                'advanced_reporting': False,
                'api_access': False,
                'white_labeling': False,
                'support': 'community',
                'trial_days': 14,
            },
            'is_active': True,
        },
        {
            'name': 'Basic',
            'plan_type': 'basic',
            'description': 'Essential tools for independent advocates.',
            'price': '999.00',
            'billing_cycle': 'monthly',
            'max_advocates': 5,
            'max_paralegals': 5,
            'max_admins': 2,
            'max_users': 15,
            'max_clients': 50,
            'max_cases': 200,
            'max_storage_gb': 10,
            'max_branches': 1,
            'enable_billing': True,
            'enable_calendar': True,
            'enable_documents': True,
            'enable_reports': False,
            'enable_api_access': False,
            'features': {
                'automated_billing': False,
                'advanced_reporting': False,
                'api_access': False,
                'white_labeling': False,
                'support': 'email',
            },
            'is_active': True,
        },
        {
            'name': 'Business',
            'plan_type': 'professional',
            'description': 'Comprehensive suite for growing law firms.',
            'price': '2499.00',
            'billing_cycle': 'monthly',
            'max_advocates': 50,
            'max_paralegals': 50,
            'max_admins': 10,
            'max_users': 120,
            'max_clients': 999999,
            'max_cases': 999999,
            'max_storage_gb': 100,
            'max_branches': 10,
            'enable_billing': True,
            'enable_calendar': True,
            'enable_documents': True,
            'enable_reports': True,
            'enable_api_access': False,
            'features': {
                'automated_billing': True,
                'advanced_reporting': True,
                'api_access': False,
                'white_labeling': False,
                'support': 'priority_24_7',
            },
            'is_active': True,
        },
        {
            'name': 'Enterprise',
            'plan_type': 'enterprise',
            'description': 'Custom solutions for large legal enterprises.',
            'price': '0.00',  # Custom pricing
            'billing_cycle': 'monthly',
            'max_advocates': 999999,
            'max_paralegals': 999999,
            'max_admins': 999999,
            'max_users': 999999,
            'max_clients': 999999,
            'max_cases': 999999,
            'max_storage_gb': 999999,
            'max_branches': 999999,
            'enable_billing': True,
            'enable_calendar': True,
            'enable_documents': True,
            'enable_reports': True,
            'enable_api_access': True,
            'features': {
                'automated_billing': True,
                'advanced_reporting': True,
                'api_access': True,
                'white_labeling': True,
                'dedicated_account_manager': True,
                'support': 'dedicated',
                'custom_domain': True,
            },
            'is_active': True,
        },
    ]

    for plan_data in plans:
        SubscriptionPlan.objects.get_or_create(
            name=plan_data['name'],
            billing_cycle=plan_data['billing_cycle'],
            defaults=plan_data,
        )


def reverse_seed(apps, schema_editor):
    SubscriptionPlan = apps.get_model('subscriptions', 'SubscriptionPlan')
    SubscriptionPlan.objects.filter(
        name__in=['Trial', 'Basic', 'Business', 'Enterprise']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0004_platforminvoice'),
    ]

    operations = [
        migrations.RunPython(seed_plans, reverse_seed),
    ]
