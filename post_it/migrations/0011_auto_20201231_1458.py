# Generated by Django 3.1.2 on 2020-12-31 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_it', '0010_auto_20201217_1655'),
    ]

    operations = [
        migrations.AlterField(
            model_name='session',
            name='running',
            field=models.BooleanField(default=False),
        ),
    ]
