* [Overview and Origins](#overview-and-origins)
* [Setup Instructions](#setup-instructions)
* [Project Structure](#project-structure)
* [UI Code Structure](#ui-code-structure)

# Overview and Origins 

Note, this project is currently in a rough draft state. In the end, hopefully this will be suitable at least for teaching REST API development in java, as there are many basic concepts that are touched upon. This is still in a very rough state at least another week is needed for a decent demo but it does run. 

This project in one sense is a basic forum where users post messages that are organized by tags. This simple structure is pervasive across the web today. I believe there is something fundamental about this structure. From a certain [neurocognitive lingustic](http://www.ruf.rice.edu/~lngbrain/nonframe.htm) point of view, our brain forms categories as a fundamental unit of cognition and communication. There are similar concepts related to class membership in [semantic web](https://github.com/JoshData/rdfabout/blob/gh-pages/intro-to-rdf.md) technologies. This field of study was advanced by [Tim Berners-Lee](https://www.w3.org/People/Berners-Lee/) founder of the web. It is interesting to note that a "user" need not be a human being, but could be a machine learning algorithm - imagine a bot loading a book and then having a SentimentAnalysisBot that would reply with what it thought was the appropriate tags etc. Tags are the generalizations of members and replies are the process of some sort of intelligence or algorithm parsing a message. 

Around 2007, I started studying this field due to an interest in graphical models from grad school and I bought the domain categorize.us. A few years layer, I became interested in the [decentralized web](https://dci.mit.edu/decentralizedweb/) - which also has [Tim Berners-Lee's](https://solid.inrupt.com/about) focus. Of course, the rise of cryptocurrency has sparked great interest in decentralized systems. The basic idea of a decentralized system is rather than some central authority owning your data, you own your data and bring the computation to that data. I ended up applying to ycombinator with an idea about [cryptographically secure p2p communication systems](https://vimeo.com/21273201) - we got some good feedback about how we didn't have, you know, and kind of a business model... Anyway, I've been exploring this idea for quite some [time](https://vimeo.com/keefe) I explored several interesting datasets, including a very large fragments of the Gawker network and the Artstor art database. 

I didn't apply very good software engineer methods on these prototypes and as time passed, they became difficult to move forward. I decided to take the last totally careless prototype and break it down into a REST API with a corresponding java API in a deliberately simple and modular fashion. There are a lot of problems with this as of this commit. My idea was to take the prototype, simplify and modularize it. Concentrate on the API and get some kind of a rudimentary UI working. Next, I need to update the "accession" project which will allow me to load some data in. I want to try a few different uses for each module before solidifying the API, at which point unit test and performance tests will be written starting with the core and moving outward. 


# Setup Instructions

### Dependencies

The following need to be installed : 

1. java version 8 or higher, haven't tested on 10 or 11 yet. 
2. [PostGreSQL](https://www.postgresql.org/)
3. [eclipse](https://www.eclipse.org/) or whatever
4. [git](https://git-scm.com/downloads)

if in windows, make sure to configure git and text editors to all use unix style line endings (LF not CRLF). I configure git to checkout as is, commit with LF endings. 
Maybe this setting? core.autocrlf=input. java can understand linux style directory separators now. 

### Code Setup

Checkout the projects

1. git clone git@github.com:keefe/categorizeus.core.git
2. git clone git@github.com:keefe/categorizeus.naive.git
3. git clone git@github.com:keefe/categorizeus.naive.users.git
4. git clone git@github.com:keefe/categorizeus.naive.app.git

In eclipse, the easiest thing to do is import as maven projects, this will handle the depency relationships. The nice thing about using this plugin is that adding a dependency propagates through. If I'm not using private maven dependencies then often I prefer command line but this makes life a lot easier, making a change in one proejct and seeing it propagate to the next. 

Outside of eclipse, run mvn install in the order listed above, so that dependencies make sense. 

### Configuration

#### Database Creation

postgres should be running in the background. Let's log into psql and make a user and create the database schema.
Use whatever user and database you like. 
Some commands for reference:
  http://postgresguide.com/utilities/psql.html
  https://www.postgresql.org/docs/10/app-psql.html
  https://www.postgresql.org/docs/11/sql-commands.html
so we'll run:
  create database categories;
  create user categorizeus with password 'password';
  grant all privileges on database categories to categorizeus;
  
#### Schema Setup

Under categorizeus.naive/src/main/resources/sql/basic there is schema.sql and seed.sql, which will setup or reset the database after changes. 

#### Configuration 

Edit categorizeus.naive/src/main/resources/categorizeus.properties and configure the database connection metadata and a directory to store static files, FILE_BASE, which will be used for uploads. Please use an absolute path. 

In categorizeus.naive.app/src/main/resources/categorizeus.naive.properties configure this to be the absolute path of the html/javascript/css files for the UI, this is STATIC_DIR and should be <project base>/categorizeus.naive.app/src/main/resources/static

### Run the Code

Under categorizeus.naive.app, run with NaiveApp. Currently, the UI doesn't have a method to register new users and in general, there needs to be a bootstrap process. Note this commented out section of code

```		
		/*
		User user = new User();
		user.setUsername("youruser");
		user.setPasshash(NaiveUserStore.sha256hash(NaiveUserStore.sha256hash("yourpassword")));
		Configuration.instance().getUserStore().registerUser(user);
		*/
```
Remove the comment and put your username and password and you'll have a bootstrap user. In an OAuth implementation, this would be a whitelisted user as admin in the database, but that is to come. I'm also aware of the constant debate about hashing on the client side and then against on the server. I personally think it doesn't hurt and reduces a vector which could cause exposure of a password to another site. I would prefer not to think about plain text passwords in my codebases at all. 

# Project Structure

Current video walkthrough : https://youtu.be/5-Lfo_yRAtw

1. git clone git@github.com:keefe/categorizeus.core.git

This is the core REST API, implemented in jax-rs. There are 3 core classes:
	* MessageStore - storage and search for messages.
	* UserStore - local representation of users. 
	* Authorizer - determination of authorization for each action. 

2. git clone git@github.com:keefe/categorizeus.naive.git

Super simple, naive implementation of storing users and messages in postgresql. 

3. git clone git@github.com:keefe/categorizeus.naive.users.git

The users project should strictly be responsible for authentication. There will very quickly be an OAuth version of this plugin, that is what the implementation is 

4. git clone git@github.com:keefe/categorizeus.naive.app.git

The app packages wire together all of the other packages. 

# UI Code Structure

As the rest of this project, this is meant to be a simple implementation. A react, angular etc implementation would be in different projects. There is categorizeus.js which is meant to just be the client for the REST API. The implementation is using nodejs style callbacks of the form cb(error, results). It's all global functions at the moment. 

The overall structure is based on [handlebars](https://handlebarsjs.com/) templates. These are extremely simple client side templates for html. They're declared as script tags in index.html and then loaded into functions on initialization. I looked into the idea of storing them as separate html files and compiling them then, but it looks like the best solution for a production build would be to use their nodejs library to precompile them. 

I'm not sure if jquery could be easily removed from the build, I think maybe it could. mainui.js contains the code to compile the templates and respond to actions from the UI and style is predictably in mainui.css

