#!/bin/bash
git clone git@github.com:keefe/categorizeus.core.git
git clone git@github.com:keefe/categorizeus.naive.git
git clone git@github.com:keefe/categorizeus.naive.users.git
git clone git@github.com:keefe/categorizeus.naive.app.git
git clone git@github.com:keefe/categorizeus.naive.accession.git
mkdir files
mkdir secrets
cp categorizeus.naive.app/secrets-template.properties secrets/secrets.properties
