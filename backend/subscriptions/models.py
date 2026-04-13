from django.db import models
import uuid

class SubscriptionPlan(models.Model):
    PLAN_TYPE_CHOICES = [
        ('basic', 'Basic'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
        ('custom', 'Custom'),
    ]
    
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, default='basic')
    
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    
    # Limits
    max_users = models.IntegerField(default=5, help_text="Maximum number of users allowed")
    max_cases = models.IntegerField(default=50, help_text="Maximum number of active cases allowed")
    max_storage_gb = models.IntegerField(default=5, help_text="Storage limit in GB")
    
    # Features (JSON for flexibility)
    features = models.JSONField(default=dict, help_text="Map of enabled features e.g. {'analytics': true}")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_billing_cycle_display()})"

class FirmSubscription(models.Model):
    STATUS_CHOICES = [
        ('trialing', 'Free Trial'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firm = models.OneToOneField('firms.Firm', on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trialing')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    
    is_trial = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=True)
    
    # External Payment tracking
    external_subscription_id = models.CharField(max_length=255, blank=True, null=True) # e.g. Stripe ID
    external_customer_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.firm.firm_name} - {self.plan.name} ({self.get_status_display()})"

    @property
    def is_valid(self):
        from django.utils import timezone
        return self.status in ['active', 'trialing'] and self.end_date > timezone.now()
