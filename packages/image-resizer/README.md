# image-resizer

This is a Cloud Run service that resizes images uploaded to a Cloud Storage bucket.

## Environment Variables

- `PORT`: The port number of the server, default to `8080`
- `TARGET_FOLDER`: The folder name of the resized images, default to `images`
- `TARGET_SIZES`: The sizes of the resized images, separated by comma, default to `2000,1200,800,400`
- `SLACK_LOG_HOOK`: The Slack webhook URL for logging
- `PROJECT_ID`: The GCP project ID (unnessecary if running on Cloud Run with correct service account)
- `KEY_FILENAME`: The path to the GCP service account key file (unnessecary if running on Cloud Run with correct service account)

## Deploy

The root Cloud Build configuration builds and deploys the image-resizer Cloud
Run service. See [deploy/README.md](deploy/README.md) for configuration, secret
provisioning, and rollout instructions.

### Eventarc

Cloud Audit Logs

```bash
gcloud eventarc triggers create imageresizer-cal \
--location=asia-east1 \
--service-account=496849015885-compute@developer.gserviceaccount.com \
--destination-run-service=prod-image-resizer \
--destination-run-region=asia-east1 \
--destination-run-path="/" \
--event-filters="type=google.cloud.audit.log.v1.written" \
--event-filters="serviceName=storage.googleapis.com" \
--event-filters="methodName=storage.objects.create" \
--event-filters-path-pattern="resourceName=projects/_/buckets/kids-storage.twreporter.org/objects/images/*"
```

The source folder is set here in Eventarc filter. The target folder is set in the environment variable `TARGET_FOLDER`.

Example event payload:

```json
{
  "@type": "type.googleapis.com/google.events.cloud.audit.v1.LogEntryData",
  "protoPayload": {
    "status": {},
    "authenticationInfo": {
      "principalEmail": "EXAMPLE_EMAIL"
    },
    "requestMetadata": {
      "callerIp": "EXAMPLE_IP",
      "callerSuppliedUserAgent": "EXAMPLE_USER_AGENT",
      "requestAttributes": {},
      "destinationAttributes": {}
    },
    "serviceName": "storage.googleapis.com",
    "methodName": "storage.objects.create",
    "authorizationInfo": [],
    "resourceName": "projects/_/buckets/BUCKET_NAME/objects/SOURCE_FOLDER/IMAGEFILE.jpg",
    "serviceData": {},
    "resourceLocation": {
      "currentLocations": []
    }
  },
  "insertId": "EXAMPLE_ID",
  "resource": {
    "type": "gcs_bucket",
    "labels": {
      "bucket_name": "BUCKET_NAME",
      "project_id": "PROJECT_ID",
      "location": "asia-east1"
    }
  },
  "timestamp": "2023-11-29T10:26:41.688857652Z",
  "severity": "INFO",
  "logName": "projects/PROJECT_ID/logs/cloudaudit.googleapis.com%2Fdata_access",
  "receiveTimestamp": "2023-11-29T10:26:42.596060Z"
}
```

Eventarc will automatically create a Pub/Sub topic and a subscription for the trigger. To ensure the large images are processed:

- `Acknowledgement deadline` must be set to a large number, e.g. 200 seconds. (default 10)
- Enable `Dead lettering` for failed messages
- In Retry policy, `Minimum backoff` must be set to a large number, e.g. 100 seconds. (default 10)
