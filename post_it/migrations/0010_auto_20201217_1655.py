# Generated by Django 3.1.2 on 2020-12-17 15:55

from django.db import migrations, models
import post_it.models


class Migration(migrations.Migration):

    dependencies = [
        ('post_it', '0009_auto_20201217_1639'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='session_code',
            field=models.CharField(default=post_it.models.generate_code, max_length=10, unique=True),
        ),
    ]
