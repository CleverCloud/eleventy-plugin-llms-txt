---
layout: base.njk
title: Blog
description: Blog posts for our example site
author: Example Author
---

# Blog

This is the blog index page for our example site.

## Posts

{% for post in collections.post %}
- [{{ post.data.title }}]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }}
{% endfor %}
