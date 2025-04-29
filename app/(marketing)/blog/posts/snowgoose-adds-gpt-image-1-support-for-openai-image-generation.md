---
title: "Snowgoose Adds gpt-image-1 Support for OpenAI Image Generation"
date: "2025-04-28"
excerpt: "OpenAI releases an API for their latest image generation model and Snowgoose now supports it"
tags: ["snowgoose", "image-generation", "openai", "gpt-image-1"]
---

Exciting announcement! OpenAI has finally added API access for their latest (and quickly viral) image generation model: gpt-image-1.
Paid users will find this model under `openai-image` in the models dropdown.

## Image Generation Options

There are a few options in the "More options" section:

- **Image Size**: Three options:
  - auto (let the model choose for you)
  - 1024x1024 (square)
  - 1024x1536 (portrait)
  - 1526x1024 (landscape)
- **Image Quality**: low, medium, and high. Lower quality will obviously use more credits. There is also an auto setting to let the model choose for you.
- **Image Background**: auto will let the model choose based on your query. Transparent will ask the model to make the background transparent. Opaque will try to force the model to never use a transparent background.

## Image Editing

You can upload an image (like you would with any other AI model in Snowgoose) and ask OpenAI for a variation of it. You can change the style, ask it to tweak it in some way or ask it to add a portion of it to a new generated image.

## Some notes

We notice that sometimes the model doesn't follow the prefered options and does its own thing. We aren't sure if these options are more of a suggestion to the AI model or if OpenAI is still tweaking its API settings.
One other note. This model is expensive! Each image generation can cost between 1 and 30 credits depending on size and quality.
OpenAI has given us the option to use the default moderation or "low moderation". We chose low moderation as it still seems to moderate quite a bit.
Thank you for using Snowgoose and we hope you enjoy generating some images!
