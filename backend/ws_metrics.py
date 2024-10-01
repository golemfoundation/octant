import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='ws_metrics.log', filemode='w')

def parse_timestamp(timestamp):
    return datetime.fromtimestamp(timestamp)

def calculate_durations(events):
    first_event_time = parse_timestamp(events[0]['time'])
    last_event_time = parse_timestamp(events[-1]['time'])

    allocation_start_time = None
    allocate_sent_time = None
    threshold_received_time = None
    disconnect_time = None
    non_201_allocate_responses = 0

    for event in events:
        event_time = parse_timestamp(event['time'])
        if event['event'].startswith('error'):
            logging.error(f"Error event found: {event}")

        if event['event'] == 'allocate_request':
            allocate_sent_time = event_time
        elif event['event'] == 'allocate_response':
            threshold_received_time = event_time
            if event.get('status_code') != 201:
                non_201_allocate_responses += 1
                logging.error(f"Allocate response with status code {event.get('status_code')} found: {event}")
        elif event['event'] == 'threshold_received':
            threshold_received_time = event_time
        elif event['event'] == 'disconnect':
            disconnect_time = event_time
        elif event['event'] == 'nonce_request':
            allocation_start_time = event_time

    metrics = {
        'duration_from_first_to_last_event': (last_event_time - first_event_time).total_seconds(),
        'duration_before_allocation': (allocation_start_time - first_event_time).total_seconds() if allocation_start_time else None,
        'duration_allocate_to_threshold': (threshold_received_time - allocate_sent_time).total_seconds() if allocate_sent_time and threshold_received_time else None,
        'duration_threshold_to_disconnect': (disconnect_time - threshold_received_time).total_seconds() if threshold_received_time and disconnect_time else None,
        'non_201_allocate_responses': non_201_allocate_responses
    }

    return metrics

def aggregate_metrics(all_metrics):
    aggregated = {
        'duration_from_first_to_last_event': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'duration_before_allocation': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'duration_allocate_to_threshold': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'duration_threshold_to_disconnect': {'min': float('inf'), 'max': float('-inf'), 'total': 0, 'count': 0},
        'non_201_allocate_responses': {'total': 0, 'count': 0}
    }

    for metrics in all_metrics:
        for key in aggregated.keys():
            if key == 'non_201_allocate_responses':
                aggregated[key]['total'] += metrics[key]
                aggregated[key]['count'] += 1
            elif metrics[key] is not None:
                aggregated[key]['min'] = min(aggregated[key]['min'], metrics[key])
                aggregated[key]['max'] = max(aggregated[key]['max'], metrics[key])
                aggregated[key]['total'] += metrics[key]
                aggregated[key]['count'] += 1

    # Calculate averages
    for key in aggregated.keys():
        if key != 'non_201_allocate_responses' and aggregated[key]['count'] > 0:
            aggregated[key]['avg'] = aggregated[key]['total'] / aggregated[key]['count']
        elif key == 'non_201_allocate_responses':
            aggregated[key]['avg'] = aggregated[key]['total'] / aggregated[key]['count'] if aggregated[key]['count'] > 0 else None
        else:
            aggregated[key]['avg'] = None


    return aggregated

def process_file(file_path):
    try:
        with open(file_path, 'r') as file:
            events = json.load(file)

        metrics = calculate_durations(events)
        return metrics
    except Exception as e:
        logging.error(f"Error processing file {file_path}: {e}")
        return None

def main():
    ws_logs_dir = 'wr_logs'
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
            if key == 'non_201_allocate_responses':
                print(f"  {key.replace('_', ' ').title()}: {value['total']} occurrences")
            else:
                print("key", key)
                print("value", value)
                print(f"  {key.replace('_', ' ').title()}:")
                print(f"    Min: {value['min']} seconds")
                print(f"    Max: {value['max']} seconds")
                print(f"    Avg: {value['avg']} seconds")
    else:
        print("Failed to aggregate metrics.")

if __name__ == "__main__":
    main()