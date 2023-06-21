// mod.ts

interface LabelAnnotation {
  description: string;
  score: number;
  topicality: number;
}

// configured as a global in _resource.json
declare const GOOGLE_VISION_API_KEY: string;

export const returnTagsForImageUrls = async (input: string) => {
  try {
    // the input is a stringified array of urls seperated by commas
    const imageUrls = input.split(",");
    const tags: string[] = [];

    for (const imageUrl of imageUrls) {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                image: {
                  source: {
                    imageUri: imageUrl,
                  },
                },
                features: [
                  {
                    type: "LABEL_DETECTION",
                    maxResults: 10,
                  },
                ],
              },
            ],
          }),
        }
      );
      const result = await response.json();
      const labelAnnotations: LabelAnnotation[] | undefined =
        result.responses?.[0].labelAnnotations;

      if (labelAnnotations) {
        labelAnnotations
          .filter(
            // filter out any tags that are not above a certain score and prevent duplicates
            (label) => label.score >= 0.75 && !tags.includes(label.description)
          )
          .forEach((labelAnnotation) => tags.push(labelAnnotation.description));
      }
    }

    return tags.toString();
  } catch (_e) {
    // return an empty array if there is an error
    return [];
  }
};

export default returnTagsForImageUrls;
