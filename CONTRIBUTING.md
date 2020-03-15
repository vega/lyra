Lyra Contributing Guidelines
=======================

New to Lyra? Check out "First PR" tag in the issues. These are issues have a lower level of effort for people looking to get their hands dirty in the Lyra codebase.

## Guideline Contents

There are a lot of ways to get involved and help out:

- [Reporting an issue](#reporting-issues)
- [Requesting features](#requesting-features)
- [Submitting Pullrequests](#how-to-submit-a-pull-request)
- [Writing Documentation & tutorials](#writing-documentation--tutorials)
- [Contributing Design Assets](#contributing-to-design)

<a name="reporting-issues"></a>
## Reporting Issues

When creating a new issue for a bug please include the following:
- **the browser you discovered the bug in**
- **a description of the problem**
- **a description of what you expected to happen**

If it's applicable, include an image of the issue or a gif of the interaction. You can capture your screen as a gif using [LiceCap](http://www.cockos.com/licecap/).


## Requesting Features
To request a new feature for the Lyra application, create an issue with the following:
 - **What feature you'd like to see**
 - **Why it is important to you**

The more details you provide make it easier for people to scope the amount of work involved in creating the new feature.


## How to submit a Pull Request
We are trying to keep Lyra at full test coverage so any pull requests opened on the project must contain tests to be merged. If you have trouble writing tests, reach out to the project maintainers for help. (email: arvindsatya1@gmail.com)

When submitting a PR, please link to any relevant issues the code relates to.  The pull request must also contain a short high level description of the problem you were trying to solve, as well as steps to functionally test it.  All code will be reviewed and tested by QA before it can be merged into the master branch.

Document your code in comments. If you create a new class or piece of functionality, at the top of the file write a very high level comment about the purpose of the code.  Knowing the original intent behind a piece of code helps protect against "spaghettifying" code when refactoring and adding new features.
Also add comments describing the purpose of each function. These can be as detailed as required.

For quality purposes, the person who opened the Pull Request cannot merge their own work into master.


## Writing Documentation & Tutorials
The documentation for the Lyra project is located in the gh-pages branch. Documentation can come in the form of tutorials on using the application, contributing to the app, and making design assets.
If modifying existing documentation, submit a PR to the gh-pages branch.
If creating new documentation or tutorials, create an issue and label it "Documentation." New documentation will be iterated on inside a github issue and transferred to the gh-pages branch when finalized.


## Contributing to Design

Design encompasses not only visual design, but UX practices as well. Personas, journey maps, and documentation content guides are located in the gh-pages branch. For contributing design assets to the Lyra project, look under the github issues for the tag 'Design'.

To add to the existing design assets, create a new issue and with the label 'design.' Design work is iterated on in issues and then transferred to the gh-pages branch when finalized.




