import json
import os
from datetime import datetime
import numpy as np

def parse_timestamp(timestamp):
    return datetime.fromtimestamp(timestamp)

def calculate_metrics(events):
    first_event_time = parse_timestamp(events[0]['time'])
    last_event_time = parse_timestamp(events[-1]['time'])

    allocate_request_time = None
    payload_generated_time = None
    nonce_request_time = None
    response_times = {}
    response_counts = {}

    for event in events:
        event_time = parse_timestamp(event['time'])
        if event['event'] == 'nonce_response':
            nonce_request_time = event_time
        elif event['event'] == 'payload_generated':
            payload_generated_time = event_time
        elif event['event'] == 'allocate_request':
            allocate_request_time = event_time
        elif event['event'] == 'allocate_response':
            allocate_response_time = event_time
            status_code = event.get('status_code')
            if status_code not in response_times:
                response_times[status_code] = []
                response_counts[status_code] = 0
            response_times[status_code].append((allocate_response_time - allocate_request_time).total_seconds())
            response_counts[status_code] += 1

        # If theres no "allocate_response" we should assume it's a 600 status code
    if 'allocate_response' not in [e['event'] for e in events]:
        print("No allocate response found", events)
        status_code = 600
        if status_code not in response_times:
            response_times[status_code] = []
            response_counts[status_code] = 0
        response_times[status_code].append((last_event_time - allocate_request_time).total_seconds())
        response_counts[status_code]

    metrics = {
        'response_times': response_times,
        'response_counts': response_counts,
        'payload_generation_duration': (payload_generated_time - nonce_request_time).total_seconds() if payload_generated_time and nonce_request_time else None,
        'nonce_request_duration': (nonce_request_time - first_event_time).total_seconds() if nonce_request_time else None,
        'first_event_time': first_event_time.timestamp(),
        'last_event_time': last_event_time.timestamp(),
    }

    return metrics

def aggregate_metrics(all_metrics):
    aggregated = {
        'response_times': {},
        'response_counts': {},
        'payload_generation_duration': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'nonce_request_duration': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'first_event_time': float('inf'),
        'last_event_time': float('-inf'),
        'total_requests': 0,
    }

    for metrics in all_metrics:
        for status_code, times in metrics['response_times'].items():
            if status_code not in aggregated['response_times']:
                aggregated['response_times'][status_code] = {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0, 'times': []}
                aggregated['response_counts'][status_code] = 0
            for time in times:
                aggregated['response_times'][status_code]['min'] = min(aggregated['response_times'][status_code]['min'], time)
                aggregated['response_times'][status_code]['max'] = max(aggregated['response_times'][status_code]['max'], time)
                aggregated['response_times'][status_code]['total'] += time
                aggregated['response_times'][status_code]['count'] += 1
                aggregated['response_times'][status_code]['times'].append(time)
            aggregated['response_counts'][status_code] += metrics['response_counts'][status_code]

        for key in ['payload_generation_duration', 'nonce_request_duration']:
            if metrics[key] is not None:
                aggregated[key]['min'] = min(aggregated[key]['min'], metrics[key])
                aggregated[key]['max'] = max(aggregated[key]['max'], metrics[key])
                aggregated[key]['total'] += metrics[key]
                aggregated[key]['count'] += 1

        aggregated['first_event_time'] = min(aggregated['first_event_time'], metrics['first_event_time'])
        aggregated['last_event_time'] = max(aggregated['last_event_time'], metrics['last_event_time'])
        aggregated['total_requests'] += 1

    # Calculate averages and additional statistics
    for key in ['payload_generation_duration', 'nonce_request_duration']:
        if aggregated[key]['count'] > 0:
            aggregated[key]['avg'] = aggregated[key]['total'] / aggregated[key]['count']
        else:
            aggregated[key]['avg'] = None

    for status_code, data in aggregated['response_times'].items():
        if data['count'] > 0:
            data['avg'] = data['total'] / data['count']
            data['median'] = np.median(data['times'])
            data['90th_percentile'] = np.percentile(data['times'], 90)
            data['80th_percentile'] = np.percentile(data['times'], 80)
            data['std_dev'] = np.std(data['times'])
        else:
            data['avg'] = data['median'] = data['90th_percentile'] = data['std_dev'] = None

    # Calculate requests per second
    total_duration = aggregated['last_event_time'] - aggregated['first_event_time']
    if total_duration > 0:
        aggregated['requests_per_second'] = aggregated['total_requests'] / total_duration
    else:
        aggregated['requests_per_second'] = None

    return aggregated

def process_file(file_path):
    try:
        with open(file_path, 'r') as file:
            events = json.load(file)

        metrics = calculate_metrics(events)
        return metrics
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return None

def main():
    ws_logs_dir = 'wr_logs_flask_1'
    if not os.path.exists(ws_logs_dir):
        print(f"Directory {ws_logs_dir} does not exist.")
        return

    all_metrics = []
    for file_name in os.listdir(ws_logs_dir):
        file_path = os.path.join(ws_logs_dir, file_name)
        if os.path.isfile(file_path):
            metrics = process_file(file_path)
            if metrics:
                all_metrics.append(metrics)

    aggregated_metrics = aggregate_metrics(all_metrics)

    if aggregated_metrics:
        print("Aggregated Metrics:")
        for key, value in aggregated_metrics.items():
            if key in ['first_event_time', 'last_event_time']:
                print(f"  {key.replace('_', ' ').title()}: {datetime.fromtimestamp(value)}")
            elif key == 'requests_per_second':
                print(f"  {key.replace('_', ' ').title()}: {value} requests/second")
            elif key == 'response_counts':
                print("  Response Counts:")
                for status_code, count in value.items():
                    print(f"    {status_code}: {count} requests")
            elif key == 'response_times':
                print("  Response Times:")
                for status_code, data in value.items():
                    print(f"    Status Code {status_code}:")
                    print(f"      Min: {data['min']} seconds")
                    print(f"      Max: {data['max']} seconds")
                    print(f"      Avg: {data['avg']} seconds")
                    print(f"      Median: {data['median']} seconds")
                    print(f"      90th Percentile: {data['90th_percentile']} seconds")
                    print(f"      80th Percentile: {data['80th_percentile']} seconds")
                    print(f"      Std Dev: {data['std_dev']} seconds")
                    print(f"      Num: {data['count']} requests")
            elif isinstance(value, dict):
                print(f"  {key.replace('_', ' ').title()}:")
                print(f"    Min: {value.get('min')} seconds")
                print(f"    Max: {value.get('max')} seconds")
                print(f"    Avg: {value.get('avg')} seconds")
            else:
                print(f"  {key.replace('_', ' ').title()}: {value}")
    else:
        print("Failed to aggregate metrics.")

if __name__ == "__main__":
    main()