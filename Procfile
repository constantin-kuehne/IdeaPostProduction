release: python manage.py migrate
web: daphne post_it_website.asgi:application --port $PORT --bind 0.0.0.0 -v2
worker: python manage.py runworker --settings=post_it_website.settings -v2