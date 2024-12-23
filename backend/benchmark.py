import requests
import concurrent.futures
from collections import Counter

# URL to test
URL = "https://uat-backend.octant.wildland.dev/rewards/projects/estimated"

# Parameters for the load test
CONCURRENT_REQUESTS = 200
TOTAL_REQUESTS = 100

# Function to make a single request
def make_request(_):
    try:
        response = requests.get(URL, timeout=60)
        return response.status_code
    except requests.RequestException as e:
        return f"Error: {str(e)}"

def main():
    # Use a thread pool for concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
        responses = list(executor.map(make_request, range(TOTAL_REQUESTS)))

    # Count occurrences of each HTTP status code
    counts = Counter(responses)

    # Separate HTTP status codes and errors
    status_codes = {k: v for k, v in counts.items() if isinstance(k, int)}
    errors = {k: v for k, v in counts.items() if isinstance(k, str)}

    # Print HTTP status codes
    print("HTTP Status Code Counts:")
    for status_code, count in sorted(status_codes.items()):
        print(f"{status_code}: {count}")

    # Print errors
    if errors:
        print("\nErrors:")
        for error, count in errors.items():
            print(f"{error}: {count}")

if __name__ == "__main__":
    main()
