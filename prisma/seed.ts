import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Render Types
  const markdownType = await prisma.renderType.upsert({
    where: { id: 1 },
    update: { name: "markdown" },
    create: { name: "markdown" },
  });

  const htmlType = await prisma.renderType.upsert({
    where: { id: 2 },
    update: { name: "html" },
    create: { name: "html" },
  });

  // API Vendors
  const openaiVendor = await prisma.aPIVendor.upsert({
    where: { id: 1 },
    update: { name: "openai" },
    create: { name: "openai" },
  });

  const anthropicVendor = await prisma.aPIVendor.upsert({
    where: { id: 2 },
    update: { name: "anthropic" },
    create: { name: "anthropic" },
  });

  const googleVendor = await prisma.aPIVendor.upsert({
    where: { id: 3 },
    update: { name: "google" },
    create: { name: "google" },
  });

  const openRouterVendor = await prisma.aPIVendor.upsert({
    where: { id: 4 },
    update: { name: "openrouter" },
    create: { name: "openrouter" },
  });

  // Persona
  await prisma.persona.upsert({
    where: { id: 1 },
    update: { name: "General", prompt: "You are a helpful assistant" },
    create: { name: "General", prompt: "You are a helpful assistant" },
  });

  // Output Formats
  await prisma.outputFormat.upsert({
    where: { id: 1 },
    update: {
      name: "Markdown",
      prompt: "Format your response in Markdown format.",
      renderTypeId: markdownType.id,
    },
    create: {
      name: "Markdown",
      prompt: "Format your response in Markdown format.",
      renderTypeId: markdownType.id,
    },
  });

  await prisma.outputFormat.upsert({
    where: { id: 2 },
    update: {
      name: "Plain Text",
      prompt:
        "Format your response in plain text. Do not use Markdown or HTML.",
      renderTypeId: htmlType.id,
    },
    create: {
      name: "Plain Text",
      prompt:
        "Format your response in plain text. Do not use Markdown or HTML.",
      renderTypeId: htmlType.id,
    },
  });

  await prisma.outputFormat.upsert({
    where: { id: 3 },
    update: {
      name: "HTML/Tailwind",
      prompt:
        "Format your response as HTML using html tags and tailwind css classes. Use hyperlinks to link to resources but only if helpful and possible. Do not use Markdown or wrap your response in markdown. Only include what is between the html body tag. Do not use ``` tags.",
      renderTypeId: htmlType.id,
    },
    create: {
      name: "HTML/Tailwind",
      prompt:
        "Format your response as HTML using html tags and tailwind css classes. Use hyperlinks to link to resources but only if helpful and possible. Do not use Markdown or wrap your response in markdown. Only include what is between the html body tag. Do not use ``` tags.",
      renderTypeId: htmlType.id,
    },
  });

  // Models
  await prisma.model.upsert({
    where: { id: 1 },
    update: {
      apiName: "gpt-4o",
      name: "GPT-4o",
      isVision: true,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openaiVendor.id,
      isWebSearch: true,
      inputTokenCost: 0.00003,
      outputTokenCost: 0.00006,
      imageOutputTokenCost: 0.00012,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "gpt-4o",
      name: "GPT-4o",
      isVision: true,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openaiVendor.id,
      isWebSearch: true,
      inputTokenCost: 0.00003,
      outputTokenCost: 0.00006,
      imageOutputTokenCost: 0.00012,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  await prisma.model.upsert({
    where: { id: 2 },
    update: {
      apiName: "gpt-3.5-turbo",
      name: "GPT 3.5 Turbo",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openaiVendor.id,
      isWebSearch: true,
      inputTokenCost: 0.0000015,
      outputTokenCost: 0.000002,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "gpt-3.5-turbo",
      name: "GPT 3.5 Turbo",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openaiVendor.id,
      isWebSearch: true,
      inputTokenCost: 0.0000015,
      outputTokenCost: 0.000002,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  await prisma.model.upsert({
    where: { id: 5 },
    update: {
      apiName: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000015,
      outputTokenCost: 0.000075,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: true,
    },
    create: {
      apiName: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000015,
      outputTokenCost: 0.000075,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: true,
    },
  });

  await prisma.model.upsert({
    where: { id: 6 },
    update: {
      apiName: "claude-3-5-sonnet-20240620",
      name: "Claude 3.5 Sonnet",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "claude-3-5-sonnet-20240620",
      name: "Claude 3.5 Sonnet",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  await prisma.model.upsert({
    where: { id: 7 },
    update: {
      apiName: "claude-3-7-sonnet-20250219",
      name: "Claude  3.7 Sonnet",
      isVision: false,
      isImageGeneration: false,
      isThinking: true,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "claude-3-7-sonnet-20250219",
      name: "Claude  3.7 Sonnet",
      isVision: false,
      isImageGeneration: false,
      isThinking: true,
      apiVendorId: anthropicVendor.id,
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  await prisma.model.upsert({
    where: { id: 8 },
    update: {
      apiName: "gemini-2.0-flash-exp",
      name: "Gemini Flash 2.0",
      isVision: false,
      isImageGeneration: true,
      isThinking: false,
      apiVendorId: googleVendor.id,
      inputTokenCost: 0.0000005,
      outputTokenCost: 0.0000015,
      imageOutputTokenCost: 0.0000025,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "gemini-2.0-flash-exp",
      name: "Gemini Flash 2.0",
      isVision: false,
      isImageGeneration: true,
      isThinking: false,
      apiVendorId: googleVendor.id,
      inputTokenCost: 0.0000005,
      outputTokenCost: 0.0000015,
      imageOutputTokenCost: 0.0000025,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  await prisma.model.upsert({
    where: { id: 9 },
    update: {
      apiName: "deepseek/deepseek-chat",
      name: "DeepSeek V3",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openRouterVendor.id,
      inputTokenCost: 0.000001,
      outputTokenCost: 0.000002,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
    create: {
      apiName: "deepseek/deepseek-chat",
      name: "DeepSeek V3",
      isVision: false,
      isImageGeneration: false,
      isThinking: false,
      apiVendorId: openRouterVendor.id,
      inputTokenCost: 0.000001,
      outputTokenCost: 0.000002,
      imageOutputTokenCost: null,
      webSearchCost: 0.01,
      paidOnly: false,
    },
  });

  // Subscription Plans
  const freeTierPlan = await prisma.subscriptionPlan.findFirst({
    where: { stripePriceId: null },
  });

  if (!freeTierPlan) {
    await prisma.subscriptionPlan.create({
      data: {
        name: "Free Tier",
        usageLimit: 0.5,
        stripePriceId: null, // Explicitly set to null
      },
    });
    console.log("Created Free Tier subscription plan.");
  } else {
    // Optional: Update existing free tier if needed (e.g., ensure limit is correct)
    await prisma.subscriptionPlan.update({
      where: { id: freeTierPlan.id }, // Use the primary key 'id' for update
      data: {
        name: "Free Tier", // Ensure name is correct
        usageLimit: 0.5, // Ensure limit is correct
      },
    });
    console.log(
      "Found existing Free Tier subscription plan, ensured values are correct."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
