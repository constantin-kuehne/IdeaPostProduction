# Generated by Django 3.1.2 on 2020-12-17 15:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_it', '0007_session_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='code',
            field=models.CharField(default='ABCDEF', max_length=10),
        ),
    ]
