---
title: "Snowgoose Adds Streaming and OpenAI Features: In-line Image Generation & Web Search"
date: "2025-06-22"
excerpt: "Snowgoose has undergone an major update, adding streaming, and OpenAI features: in-line image generation, and web search capabilities"
tags: ["snowgoose", "openai", "image-generation", "web-search", "streaming"]
---

Snowgoose has undergone a major update, and we are excited to announce some great new features.

## Streaming

No more waiting and watching a spinner while you wait for your response. Snowgoose now supports streaming across all models. Not only does this look nicer, and get you reading your response quicker, but there are some technical benefits. Anthropic long responses were sometimes timing out if their model thought too long. The feature means no more timeout issues.

## OpenAI: Web Searching

We now support web search capabilities for all OpenAI models that offer it. Now you can ground your responses in real web data, ask for the latest news, or anything else that benefits from giving the AI access to the web.

To enable web searching, there is a new "Web Search" toggle in the "Advanced Options" popover. Web searching is a flat rate of 4 credits for every prompt it is used.

_Note: Even if web search is turned on, the model will determine if it should be used or not based on the prompt. You're only charged if the model actually uses the tool._

## OpenAI: Native, In-line Image Generation

In April, we [Added OpenAI gpt-image1 support](https://snowgoose.app/blog/snowgoose-adds-gpt-image-1-support-for-openai-image-generation). At the time, this was a seperate model that only supported generating images. Now, OpenAI supports image generation though most of it's models, meaning you can get image generation right in your normal chats.

Similar to the Web Search tool, you can enable image generation by toggling "Image Generation" in the "Advanced Options" popover. The AI will determine when to use it.

You can even combine Web Searching and Image Generation. For example: "Find a positive news story from today and generate an image of it." will search the web for a positive news story, then use its image generation tool to generate an image and return a summary of the news story with the image. Pretty cool, right?

_Note: Because this is a new API from OpenAI, they have not yet added a cost sumamry in the response. Because of this, we must assume the image costs the max price of their image generation cost structure, which is 25 credits per image._

## Other Bug Fixes

We have worked our way though our bug list and fixed many minor bugs in the system, and improved efficency. We also now have servers in Los Angeles, Phoenix, and New Jersey.
