import OpenAI from 'openai';

interface Input {
  image: string
}

interface Output {
  data: any,
  rawData: any,
  error?: string
}

const openai = new OpenAI({
  apiKey: process.env['FIREWORKS_API_KEY'],
  baseURL: 'https://api.fireworks.ai/inference/v1'
});

const model = "accounts/fireworks/models/phi-3-vision-128k-instruct"

const service = async (input: Input):Promise<Output> => {
  const completion = await openai.chat.completions.create({
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Return only valid JSON. No markdown, no code blocks, no explanatory text. The response must be parseable by JSON.parse(). Ensure all curly braces are properly matched and closed."
          }
        ]
      },
      { 
        role: "user", 
        content: [
          {
            type: "text",
            text: "Extract the following fields from the image and return them in a strict JSON format with this exact structure:\n\nFor passport:\n{\"first_name\":\"John\",\"last_name\":\"Doe\",\"dob\":\"1990-01-01\",\"document\":{\"type\":\"passport\",\"id\":\"123456789\"}}\n\nFor drivers license:\n{\"first_name\":\"John\",\"last_name\":\"Doe\",\"dob\":\"1990-01-01\",\"document\":{\"type\":\"drivers_license\",\"id\":\"DL123456\"},\"address\":{\"street\":\"123 Main St\",\"city\":\"Anytown\",\"state\":\"CA\",\"zip\":\"12345\"}}\n\nIMPORTANT: The address object must be at the root level, not inside the document object. Follow the structure exactly as shown above."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${input.image}`
            }
          }
        ]
      }
    ],
    model,
  });

  const response = completion.choices[0].message.content

  try {
    const parsedResponse = JSON.parse(response)
    return {
      data: parsedResponse,
      rawData: response
    }
  } catch (err) {
    console.error(err)
    return {
      data: {},
      rawData: response,
      error: 'parsing error'
    }
  }
}

export default service