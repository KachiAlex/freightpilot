# Generated migration to add database index on LogSheet (trip, date)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0006_dutystatus_duration_hours_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='logsheet',
            index=models.Index(fields=['trip', 'date'], name='trips_logsh_trip_id_date_idx'),
        ),
    ]
