#!/usr/bin/env python3
"""Download an .ics URL and print parsed VEVENTs in a readable format.

Usage:
  python scripts/read_ics.py <ics_url>
"""
import sys
from datetime import datetime, timedelta
from dateutil import tz
import requests
from icalendar import Calendar


def fetch_ics(url: str) -> bytes:
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.content


def parse_and_print(data: bytes):
    cal = Calendar.from_ical(data)
    events = []
    for comp in cal.walk():
        if comp.name == 'VEVENT':
            dtstart = comp.get('dtstart').dt
            dtend = comp.get('dtend').dt
            summary = str(comp.get('summary') or '')
            transp = str(comp.get('transp') or '')
            status = str(comp.get('status') or '')
            uid = str(comp.get('uid') or '')
            events.append((dtstart, dtend, summary, transp, status, uid))

    events.sort(key=lambda e: e[0])
    print(f"Found {len(events)} VEVENT(s)")
    for s, e, summary, transp, status, uid in events:
        busy = (transp.upper() != 'TRANSPARENT') and (status.upper() != 'CANCELLED')
        s_str = s.astimezone(tz.tzlocal()) if hasattr(s, 'tzinfo') else s
        e_str = e.astimezone(tz.tzlocal()) if hasattr(e, 'tzinfo') else e
        print(f"- {s_str} → {e_str} | {summary} | busy={busy} | transp={transp} | status={status} | uid={uid}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/read_ics.py <ics_url>")
        sys.exit(2)
    url = sys.argv[1]
    print("Downloading:", url)
    try:
        data = fetch_ics(url)
    except Exception as exc:
        print("Failed to fetch .ics:", exc)
        sys.exit(1)

    try:
        parse_and_print(data)
    except Exception as exc:
        print("Failed to parse .ics:", exc)
        # print a snippet of the file to help debugging
        snippet = data[:2000].decode('utf-8', errors='replace')
        print("--- .ics snippet ---\n", snippet)
        sys.exit(1)


if __name__ == '__main__':
    main()
