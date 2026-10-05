import csv
import time
from Database import Database

TARGET_CLASSIFICATIONS = [
    {
        "key": "Tu",
        "name": "Tump",
        "description": "A Tump is a hill in Scotland, England, Wales, the Isle of Man or Channel Islands which is separated from adjacent tops by a height difference of at least 30 metres on all sides.",
    },
]

def patch_classifications():
    start_time = time.time()
    print("=== Starting Fast Classification Patch ===")

    with Database() as db:
        # Step 1: Pre-load database state into RAM (<0.1s)
        print("\n[Step 1/3] Pre-loading fells and existing links into RAM...")
        
        class_map = {
            item["key"]: db.GetOrCreateClassification(item["name"], item.get("description", item["name"]))
            for item in TARGET_CLASSIFICATIONS
        }
        
        fells_by_name = db.GetAllFellsByName()
        existing_links = db.GetExistingFellClassifications()
        
        print(f"  ✓ Cached {len(fells_by_name):,} unique fell names and {len(existing_links):,} existing classification links.")

        # Step 2: Process CSV entirely in Python memory
        print("\n[Step 2/3] Processing UKHills.csv in-memory...")
        rows_processed = 0
        matched_fells = 0
        new_links = []

        with open("UKHills.csv", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            for raw_row in reader:
                rows_processed += 1
                row = {k.strip(): v.strip() for k, v in raw_row.items() if k}

                name = row.get("hillname")
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                except (ValueError, KeyError):
                    continue

                if not name:
                    continue

                # O(1) Fast Python dictionary lookup
                candidates = fells_by_name.get(name.strip().lower(), [])
                fell_id = None
                for candidate_id, c_lat, c_lon in candidates:
                    if abs(c_lat - lat) < 0.0001 and abs(c_lon - lon) < 0.0001:
                        fell_id = candidate_id
                        break

                if not fell_id:
                    continue

                matched_fells += 1

                # Collect new links without DB round-trips
                for item in TARGET_CLASSIFICATIONS:
                    key = item["key"]
                    if row.get(key) == "1":
                        class_id = class_map[key]
                        link = (fell_id, class_id)
                        
                        if link not in existing_links:
                            new_links.append(link)
                            existing_links.add(link)  # Prevent duplicates within the loop

        # Step 3: Batch Insert
        print(f"\n[Step 3/3] Writing {len(new_links):,} new classification link(s) to SQLite...")
        db.AddFellClassificationsBatch(new_links)

    elapsed = time.time() - start_time
    print(f"\n🎉 Done in {elapsed:.2f} seconds!")
    print(f"Processed {rows_processed:,} CSV rows | Matched {matched_fells:,} fells | Added {len(new_links):,} new link(s).")

if __name__ == "__main__":
    patch_classifications()