# ForgeBot
### *A Data Movement Chatbot*

ForgeBot is a Slackbot that interacts with an instance of the DataWorks service in IBM Bluemix via the DataWorks Public API.
It can be used to list, run and monitor activities that have been created in the DataWorks Forge UI, all from within a Slack channel.

### Create a Bot in your Slack organization

To add a new Bot in your Slack organization you must visit the following url: https://yourorganization.slack.com/services/new/bot, where yourorganization must be substituted with the name of your organization. Ensure you are logged in to your Slack organization in your browser and you have the admin rights to add a new bot.


In the first step you need to choose a name for your bot - in this case call it `@forgebot`. 

Then you will move to another screen where you will be able to copy your API token.

Copy the token to a safe place and save it, you will need it in a while. In this section you can also specify some more details about your bot, like the first and last name.

Click the button below to deploy this app to Bluemix. You will require a Bluemix account. Clicking this button will also create and bind an instance of the IBM DataWorks service under the Starter-GA plan.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/DamianCummins/dataworks-forgebot)

Once the application has been deployed, navigate to your Bluemix Dashboard and you should see the app and the DataWorks service.

Click the application and on the left side menu, select Environment Variables, then choose USER-DEFINED.

Replace `<YourSlackBotKeyHere>` with the Slack Bot API token from earlier.

Return to the app by clicking Overview on the left side menu, then Restart the app by clicking RESTART in the APP HEALTH section.

Once the app is running once more, open the general channel in your Slack team and send ForgeBot a message: "Forgebot commands".

Forgebot should respond with the following message:

##### Forgebot Commands:

> - Forgebot list activities
> - Forgebot list activities -v
> - Forgebot run activity <activityId>
> - Forgebot run activity -n <activityName>
> - Forgebot get status -a <activityId> -r <runId>
> - Forgebot get status -a <activityId> -r latest
> - Forgebot get status -a -n <activityName> -r latest

To create some activities for Forgebot to run, return to the Bluemix Dashboard and click the DataWorks service instance. This will bring up the launch page from which you can navigate to the Forge UI.

You can find further documentation regarding supported Sources and Targets <a href="https://console.eu-gb.bluemix.net/docs/services/dataworks1/dataworks_overview.html#dataworks_overview">here</a>.