from django.db import models

# Create your models here.
class POIModels(models.Model):
    name = models.CharField(max_length=50)
    label = models.CharField(max_length=10)
    position = models.CharField(max_length=20)
    def __unicode__(self):
        return self.name