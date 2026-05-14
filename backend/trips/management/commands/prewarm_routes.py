from django.core.management.base import BaseCommand, CommandError

from trips.services import RouteEstimator


class Command(BaseCommand):
    help = "Prewarm the route estimator cache for common origin/destination pairs and respect rate limits."

    def add_arguments(self, parser):
        parser.add_argument(
            '--pair',
            action='append',
            dest='pairs',
            default=None,
            help="Specify an origin|destination pair (can be passed multiple times)",
        )
        parser.add_argument(
            '--file',
            dest='pairs_file',
            help="Optional path to a file containing one origin|destination pair per line",
        )

    def handle(self, *args, **options):
        pairs = options.get('pairs') or []
        pairs_file = options.get('pairs_file')

        if pairs_file:
            try:
                with open(pairs_file, 'r', encoding='utf-8') as handle:
                    for line in handle.readlines():
                        cleaned = line.strip()
                        if cleaned:
                            pairs.append(cleaned)
            except OSError as exc:
                raise CommandError(f'Unable to read {pairs_file}: {exc}') from exc

        if not pairs:
            pairs = [
                'Chicago, IL|Dallas, TX',
                'Los Angeles, CA|Phoenix, AZ',
                'Memphis, TN|Atlanta, GA',
                'Seattle, WA|Portland, OR',
            ]

        estimator = RouteEstimator()
        warmed = 0
        skipped = 0

        for pair in pairs:
            try:
                origin, destination = [part.strip() for part in pair.split('|', 1)]
            except ValueError:
                self.stderr.write(self.style.WARNING(f"Skipping malformed pair '{pair}'"))
                skipped += 1
                continue

            result = estimator.estimate(origin, destination)
            if result:
                warmed += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Cached {origin} → {destination} ({result['distance_miles']} mi · {result['drive_hours']} hrs)"
                    )
                )
            else:
                self.stderr.write(self.style.WARNING(f"No coordinates found for {origin} → {destination}"))

        self.stdout.write(
            self.style.SUCCESS(f'Prewarm complete. Cached {warmed} routes, skipped {skipped}, total {len(pairs)} requested.')
        )
