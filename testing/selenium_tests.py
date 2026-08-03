"""
Selenium WebDriver Automated E2E Test Suite
Project: QA Management Suite - Web-Based Software Testing and Defect Management System

Prerequisites:
  pip install selenium webdriver-manager
"""

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

class QAManagementSuiteTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\n==========================================")
        print(" Starting Selenium Automation Test Suite ")
        print("==========================================")
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new") # Run headless for CLI
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            cls.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        except Exception:
            cls.driver = webdriver.Chrome(options=options)
        
        cls.driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        print("\n==========================================")
        print(" Automation Test Execution Completed ")
        print("==========================================")

    def test_01_user_login(self):
        """TC_LOGIN_001: Test user login functionality"""
        print("[TEST] Executing TC_LOGIN_001: Login with valid credentials...")
        self.driver.get(BASE_URL)
        
        # Enter credentials
        email_input = self.driver.find_element(By.XPATH, "//input[@type='email']")
        pass_input = self.driver.find_element(By.XPATH, "//input[@type='password']")
        submit_btn = self.driver.find_element(By.XPATH, "//button[@type='submit']")

        email_input.clear()
        email_input.send_keys("admin@qasuite.com")
        pass_input.clear()
        pass_input.send_keys("admin123")
        submit_btn.click()

        # Verify Dashboard header rendered
        dashboard_heading = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Quality Assurance Dashboard')]"))
        )
        self.assertIsNotNone(dashboard_heading)
        print("[PASS] TC_LOGIN_001: User successfully authenticated and navigated to Dashboard.")

    def test_02_navigate_modules(self):
        """TC_NAV_001: Verify STLC navigation sidebar links"""
        print("[TEST] Executing TC_NAV_001: Verify STLC Navigation...")
        
        # Click Projects
        projects_link = self.driver.find_element(By.XPATH, "//button[span[text()='Projects']]")
        projects_link.click()
        time.sleep(1)
        self.assertIn("Project Management", self.driver.page_source)

        # Click Defects
        defects_link = self.driver.find_element(By.XPATH, "//button[span[text()='Defects / Bugs']]")
        defects_link.click()
        time.sleep(1)
        self.assertIn("Defect & Bug Management", self.driver.page_source)
        
        print("[PASS] TC_NAV_001: Navigation across STLC modules verified.")

if __name__ == "__main__":
    unittest.main()
