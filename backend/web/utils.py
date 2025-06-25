import re
import time
import random
import undetected_chromedriver as uc
from django.conf import settings
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains


def human_behavior(driver):
    time.sleep(random.uniform(3, 6))
    actions = ActionChains(driver)
    actions.move_by_offset(random.randint(100, 300), random.randint(100, 300)).perform()
    driver.execute_script("window.scrollBy(0, 800);")
    time.sleep(random.uniform(1, 3))


def parse_products(query):
    url = f"{settings.WB_LINK}{query}"

    options = uc.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--headless=new")
    options.add_argument("--disable-dev-shm-usage")

    options.binary_location = settings.BINARY_LOCATION

    driver = uc.Chrome(options=options, version_main=138)
    driver.get(url)

    human_behavior(driver)
    time.sleep(30)

    products = []
    items = driver.find_elements(By.CSS_SELECTOR, 'article.product-card')
    for item in items:
        try:
            name = item.find_element(By.CSS_SELECTOR, 'a.product-card__link').get_attribute("aria-label")

            price_with_discount = item.find_element(By.CSS_SELECTOR, 'ins.wallet-price').text
            price_with_discount = int(price_with_discount.replace('₽', '').replace(' ', '').strip())

            full_price_tag = item.find_element(By.TAG_NAME, "del")
            full_price = int(full_price_tag.text.replace('₽', '').replace(' ', '').strip()) if full_price_tag else ''

            rating_tag = item.find_element(By.CSS_SELECTOR, 'span.address-rate-mini')
            rating = float(rating_tag.text.replace(',', '.')) if rating_tag else 0.0

            feedbacks_tag = item.find_element(By.CSS_SELECTOR, 'span.product-card__count')
            feedbacks = int(re.sub(r"[^\d]", "", feedbacks_tag.text)) if feedbacks_tag else 0
            print(name, price_with_discount, full_price, rating, feedbacks)
            products.append({
                'name': name,
                'price_with_discount': price_with_discount,
                'full_price': full_price,
                'rating': rating,
                'feedbacks': feedbacks
            })
        except Exception as e:
            print(f"[!] Ошибка при парсинге товара: {e}")
            continue

    driver.quit()
    return products
