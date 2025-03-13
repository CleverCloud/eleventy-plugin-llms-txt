---
layout: base.njk
title: Blog
description: Blog posts for our advanced example site
author: Horacio Gonzalez
category: Blog
tags:
  - page
---

# Blog

This is the blog index page for our advanced example site.

## Posts

{% for post in collections.post %}
- [{{ post.data.title }}]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }}
{% endfor %}
