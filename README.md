# Liberating Structures

Online meetings are difficult for a variety of reasons. It can be hard to engage participants. It can be difficult to participate since only one person can speak at a time. There is a delay that often results in participants speaking over one another. With any sufficiently large online meeting, it gets difficult to make progress collaboratively towards an objective. To address the challenges inherent in big group online meetings, we experiment with techniques:

1. we make smaller meetings
2. we take turns explicitly
3. we vote and talk about things in order of popularity
4. we have someone who facilitates the meeting to ensure we have the right outcomes and action items

These techniques are better than nothing, but they have limitations too:

1. when you make smaller meetings, you may leave someone important out of the discussion
2. taking explicit turns adds a lot of wait time for those who aren't speaking, and they may not have interest in the topic but not feel strongly enough to interrupt
3. sometimes the most useful conversations are not the most popular
4. sometimes the person who cares enough to facilitate is someone who ought to contribute as well but can't manage both facilitation and participation at the same time
5. it is easy for participants to pay attention to other things without disrupting the meeting, but this can undermine the value of meeting in the first place

## Liberating structures are useful for online meetings

Liberating structures are a series of techniques that make it easier for large groups to generate effective outcomes by virtue of a repeatable simple set of processes that require limited top-down facilitation. This is incredibly powerful for online meetings in particular, since those online meetings make it even more difficult for everyone to participate equally. However, these techniques are difficult to use with only breakout rooms since breakout rooms alone are too basic a primitive block to automate this process. Using breakouts, someone still needs to manage creation and assigning of the breakout rooms. This slack bot intends to automate the processes needed to facilitate using liberating structures so that you don't need to do so by hand. Currently the bot supports two of these, chosen for their simplicity of implementation as well as their utility:

### 1-2-4-all

This structure breaks up an arbitrarily sized group into pairs, then foursomes, and puts everyone back together again. By breaking out into smaller groups it optimizes for everyone to have a contribution and a chance to think about the topic(s) at hand. Progressively combining the groups ensures that the feedback will make it back to the larger group. Afterwards, there is a slack thread available for asynchronous conversation to continue.

### impromptu networking

This structure takes a group of people and pairs them up to discuss a prompt, switching pairs every 5 minutes. It is a nice icebreaker to enable everyone to participate and get to know each other.

## Usage suggestions

1. Use impromptu networking at the beginning or end of a meeting (even if you start in zoom, you can mute your mic there and use this to automate some quick breakouts as an icebreaker)
2. Use 1-2-4-all at the end of a large meeting (like a retro) to parallelize discussion and let individuals pick the topics they want to join. You can post each topic as its own LS post, users can react to the ones they want to join, and the rest will just happen automatically.
3. Set up an “event” on the team calendar for folks to submit as many 1-2-4-all / impromptu networking topics as they want. “Liberating Structures power hour”
4. during retro when you do ideation (generating ideas to discuss), use a 1-2-4 to generate alone as well as in pairs and small groups

## Sources

This bot aims to replicate the liberating structures defined [here](https://www.liberatingstructures.com/) in slack using forms, threads, huddles, etc to enable serendipitous synchronous conversations in slack.

## Installation

Installation is really simple:
1. [Install the slack CLI](https://api.slack.com/automation/cli/install) and login to your slack workspace.
2. Run `slack deploy`
3. For each of the triggers in the `triggers/` folder run `slack trigger create --trigger-def <TRIGGER>` to set up the triggers to launch the workflows in the application. You will get URLs that you can copy and paste anywhere into slack that will turn into buttons that you can click.

## Getting Started with Liberated Paws Bot for Activities

Welcome to Liberated Paws Bot! This section will help you understand how to get started with activities in Slack using our bot.

### Starting and Joining Activities

- To initiate an activity, use the "run workflow" triggers set up during installation, which can be accessed through commands, bookmarks, or buttons that show on workflow URL previews.
- Activities operate differently based on their type. For instance, the Water Cooler activity starts with a huddle in a thread, while others rely on emoji reactions for interest indication.
- Most activities allow users to join by reacting with Slack emojis within a specified time limit. In some cases, joining involves participating in a channel huddle.

### Customizing Activity Launch

When launching an activity, you can customize settings like delay and reaction time limits, facilitating scheduling and indicating the time allowed for participants to react and join in activities.

### Manually Starting Huddles

Users manually start huddles due to the Slack API's current inability to initiate huddles directly.

### Why Slack?

We chose Slack for activities due to its widespread use in remote organizations. The new slack CLI is easy to use and can be hosted by slack with no need to host your own server. It also supports asynchronous participation by leaving behind slack threads that can be read and responded to anytime.
