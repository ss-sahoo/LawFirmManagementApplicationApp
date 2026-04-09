from django.db import models
import uuid

class Case(models.Model):
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('disposed', 'Disposed off'),
        ('closed', 'Closed'),
        ('created', 'Created'),
        ('filed', 'Filed'),
        ('evidence', 'Evidence'),
        ('hearing', 'Hearing in Progress'),
        ('judgment', 'Judgment Received'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firm = models.ForeignKey('firms.Firm', on_delete=models.CASCADE, related_name='cases')
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='cases')
    
    assigned_advocate = models.ForeignKey(
        'accounts.CustomUser', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='cases_as_advocate'
    )
    assigned_paralegal = models.ForeignKey(
        'accounts.CustomUser', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='cases_as_paralegal'
    )
    
    case_title = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100, unique=True)
    case_type = models.CharField(max_length=100) # e.g., Criminal, Civil, Corporate, Tax
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    court_name = models.CharField(max_length=255, blank=True)
    judge_name = models.CharField(max_length=255, blank=True)
    
    filing_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.case_title} ({self.case_number})"

class CaseActivity(models.Model):
    """Tracks the lifecycle/timeline of a case"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='activities')
    performed_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    
    activity_type = models.CharField(max_length=100) # e.g., status_change, hearing_update, document_added
    description = models.TextField()
    previous_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Hearing(models.Model):
    """Tracks specific court dates and results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    
    hearing_date = models.DateTimeField()
    purpose = models.CharField(max_length=255)
    judge_remarks = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ('adjourned', 'Adjourned')],
        default='scheduled'
    )
    order_passed = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CaseDraft(models.Model):
    """Tracking drafts and petitions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='drafts')
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    draft_type = models.CharField(max_length=100) # Petition, Agreement, Affidavit, etc.
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('under_review', 'Under Review'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='draft'
    )
    version = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
