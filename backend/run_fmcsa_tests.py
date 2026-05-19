#!/usr/bin/env python
"""Quick script to run FMCSA-related tests."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import unittest
from trips.tests import HOSServiceTests

if __name__ == '__main__':
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add FMCSA-specific tests
    suite.addTest(HOSServiceTests('test_break_after_8_hours'))
    suite.addTest(HOSServiceTests('test_sleeper_after_11_hours'))
    suite.addTest(HOSServiceTests('test_fmcsa_11_hour_max_driving'))
    suite.addTest(HOSServiceTests('test_fmcsa_30_min_break_after_8_hours'))
    suite.addTest(HOSServiceTests('test_fmcsa_10_hour_mandatory_rest'))
    suite.addTest(HOSServiceTests('test_fmcsa_schedule_snapshot_recorded'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    sys.exit(0 if result.wasSuccessful() else 1)
