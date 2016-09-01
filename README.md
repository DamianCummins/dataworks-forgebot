# ForgeBot
### *A Data Movement Chatbot*

ForgeBot is a Slackbot that interacts with an instance of the DataWorks service in IBM Bluemix via the DataWorks Public API.
It can be used to list, run and monitor activities that have been created in the DataWorks Forge UI, all from within a Slack channel.


[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/DamianCummins/dataworks-forgebot)

##### Forgebot Commands:

> - Forgebot list activities
> - Forgebot list activities -v
> - Forgebot run activity <activityId>
> - Forgebot run activity -n <activityName>
> - Forgebot get status -a <activityId> -r <runId>
> - Forgebot get status -a <activityId> -r latest
> - Forgebot get status -a -n <activityName> -r latest
