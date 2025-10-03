import feedparser
import sqlite3
from datetime import datetime
import time
import schedule
from models import init_db

# Example RSS feeds (you can add more later)
FEEDS = [
    # Global / International
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://feeds.reuters.com/reuters/worldNews",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.voanews.com/rss/world.xml",
    "https://www.cnn.com/services/rss/",
    "https://www.npr.org/rss/rss.php?id=1004",
    "https://www.hindustantimes.com/feeds/rss/world/rssfeed.xml",

    # US News
    "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
    "https://www.washingtonpost.com/rss/world",
    "https://feeds.foxnews.com/foxnews/national",

    # Europe
    "https://www.euronews.com/rss?level=theme&name=news",
    "https://www.dw.com/en/top-stories/s-9097?maca=en-rss-en-all-1575-rdf",
    "https://www.france24.com/en/rss",

    # Asia
    "https://www.scmp.com/rss/91/feed",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://www.japantimes.co.jp/feed/",

    # Middle East
    "https://www.alarabiya.net/.mr/rss/en.xml",
    "https://english.alarabiya.net/.mr/rss/en.xml",
    "https://www.middleeasteye.net/rss",

    # Africa
    "https://www.africanews.com/rss",
    "https://www.enca.com/rss",


]


def fetch_and_store():
    print("🔄 Fetching news feeds...")
    conn = sqlite3.connect("gcaiphase1.db")
    c = conn.cursor()

    for url in FEEDS:
        feed = feedparser.parse(url)
        for entry in feed.entries[:5]:  # latest 5 from each feed
            # Avoid duplicates
            c.execute("SELECT * FROM news WHERE headline=?", (entry.title,))
            if not c.fetchone():
                c.execute(
                    "INSERT INTO news (headline, source, timestamp, category, bias) VALUES (?, ?, ?, ?, ?)",
                    (entry.title, entry.link, datetime.now().strftime("%Y-%m-%d %H:%M"), None, None)
                )
                print(f"✅ Stored: {entry.title}")

    conn.commit()
    conn.close()
    print("✔ Fetch complete.\n")

if __name__ == "__main__":
    init_db()

    # Run once at start
    fetch_and_store()

    # Schedule every 10 minutes
    schedule.every(10).minutes.do(fetch_and_store)

    print("🕒 Collector running... will fetch every 10 minutes.\n")

    while True:
        schedule.run_pending()
        time.sleep(1)
