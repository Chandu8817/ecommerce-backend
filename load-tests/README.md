# E-commerce API Load Testing

This directory contains load tests for the e-commerce API using [k6](https://k6.io/).

## Prerequisites

1. Install k6: https://k6.io/docs/get-started/installation/
2. Node.js (for any setup scripts or test data generation)

## Running the Tests

1. Start your e-commerce API server
2. Run the load test with the following command:

```bash
k6 run ecommerce-load-test.js
```

## Test Scenario

The load test simulates the following user flow:
1. Fetches a list of products
2. Creates a new test user
3. Logs in with the test user
4. Creates an order with a random product

## Configuration

- **Virtual Users (VUs)**: 100
- **Duration**: 10 minutes (2m ramp-up, 6m full load, 2m ramp-down)
- **Thresholds**:
  - 95% of requests should complete in under 500ms
  - Less than 10% of requests should fail

## Custom Metrics

- `errors`: Count of failed requests
- `successful_requests`: Rate of successful requests

## Viewing Results

k6 will output test results to the console. For more detailed analysis, you can output the results to a file:

```bash
k6 run --out json=test_results.json ecommerce-load-test.js
```

## Scaling the Test

To simulate more users, adjust the `VUS` constant in the test file. For 100,000 users, you might want to run this on a distributed k6 setup or use k6 Cloud.
