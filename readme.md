# KYC Image Processing Service

This is a service that processes images of passports and driver's licenses and extracts key information in a structured JSON format. It uses Microsoft's phi-3-vision-128k-instruct model running on Fireworks. This model was chosen because of it's low cost and high accuracy. You can easily change and test different models by modifying the `model` variable in `kycService.ts`. 

To run, create a `.env` file with `FIREWORKS_API_KEY` and `npm install`. Then run `npm run dev`.

## API Endpoints

### Process KYC Document
```http
POST /kyc
```

The endpoint provides three different methods for providing the image:

#### 1. Process image from filesystem
This method assumes that the file is already uploaded to the server's filesystem. The request body should include `source` and `path`:
```json
{
  "source": "filesystem",
  "path": "/path/to/image.jpg"
}
```
> **Note:** This repo contains example images in `samples/`. 

#### 2. Process image from URL
This method assumes that the file is hosted at a url that the service can access. The request body should include `source` and `url`:
```json
{
  "source": "url",
  "url": "https://example.com/image.jpg"
}
```

#### 3. Process image from base64
You also have the option to send the base64 encoded image directly. The request body should include `source` and `image`:
```json
{
  "source": "base64",
  "image": "data:image/jpeg;base64,..."
}
```

### Response Format

#### Success Response
Responses include the structured KYC information in `data` as well as the raw response from the vision model in `rawData`.
```json
{
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-01-01",
    "document": {
      "type": "passport",
      "id": "123456789"
    }
  },
  "rawData": "..." 
}
```

For driver's licenses, the response includes an additional address object:
```json
{
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-01-01",
    "document": {
      "type": "drivers_license",
      "id": "DL123456"
    },
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip": "12345"
    }
  },
  "rawData": "..."
}
```

## Files

### `app.ts`

Creates a simple Koa router with basic input validation.

### `kycService.ts`

Takes a base64 encoded image and returns the KYC information. 
The prompts instruct the model on what data to return and in what format. The service also does some basic validation on the model response (makes sure it's parsable JSON) and returns an error if it's invalid.

#### Model parameters
* **temperature = 0**: Low temperature for less randmoness and more deterministic answers.
* **top_p = 1**: High top_p so that behavior is primarily goverened my temperature setting.
* **presence_penalty = 0**: No penalty for repetition
* **frequency_penalty = 0**: No penalty for repeating words

### `processImage.ts`

Basic helper functions to process the image provided by the client.