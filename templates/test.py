import sys
import unittest
import unittest.mock

sys.modules["browser"] = unittest.mock.MagicMock()
sys.modules["browser.ajax"] = unittest.mock.MagicMock()
sys.modules["browser.local_storage"] = unittest.mock.MagicMock()

import index  # noqa


class FrontEndTestCase(unittest.TestCase):
    def test_main(self):
        index.draw_levels()


if __name__ == "__main__":
    unittest.main()
