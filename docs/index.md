* [Overview and Origins](#overview-and-origins)
* [Setup Instructions](#setup-instructions)
* [Code Structure](#code-structure)

# Overview and Origins 



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

1. git@github.com:keefe/categorizeus.core.git
2. git@github.com:keefe/categorizeus.naive.git
3. git@github.com:keefe/categorizeus.naive.users.git
4. git@github.com:keefe/categorizeus.naive.app.git

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

```		/*
		User user = new User();
		user.setUsername("youruser");
		user.setPasshash(NaiveUserStore.sha256hash(NaiveUserStore.sha256hash("yourpassword")));
		Configuration.instance().getUserStore().registerUser(user);
		*/
```
Remove the comment and put your username and password and you'll have a bootstrap user. In an OAuth implementation, this would be a whitelisted user as admin in the database, but that is to come. I'm also aware of the constant debate about hashing on the client side and then against on the server. I personally think it doesn't hurt and reduces a vector which could cause exposure of a password to another site. I would prefer not to think about plain text passwords in my codebases at all. 

# Code Structure
