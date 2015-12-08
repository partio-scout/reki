# REKI
Finnjamboree 2016 camp registry system

## Developing with Vagrant
### Prerequisites
You will need [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) on your machine.

### Installation
Clone this repository into a local directory. Enter the project directory on a command line. Initialize the Vagrant virtual machine with the command `vagrant up`. This will create a virtual machine for you and install all the required software in it.

### Running the app
Enter the project directory. If you don't have the Vagrant virtual machine running, run `vagrant up` (you can check the status with `vagrant status`). Then run `vagrant ssh` to access the virtual machine.

Inside the virtual machine run `npm start` inside the `/vagrant` directory.

The application will be available at http://localhost:3000/, from both the host and guest operating systems.

Note that the virtual machine has the `NODE_ENV`-environment variable set to `dev`, so to run in production mode, run with `NODE_ENV=production npm start`.

### File change notifications
By default file change events do not propagate between the host and virtual machine. Therefore the webpack development server and test watcher won't function properly. The notification can be easily enabled though with a vagrant plugin. If you already have vagrant running, destroy your current virtual machine with `vagrant destroy`. Then run `vagrant plugin install vagrant-notify-forwarder`, then recreate the virtual machine with `vagrant up` and enjoy your file watchers!

## ES6
ES6 syntax is supported and should be used in all files, including the module syntax.

The only exception is formed by the modules loaded by loopback (such as boot scripts, configuration override files and model js files). They cannot use the export syntax of es6 modules because the module export interface differs from the commonjs interface expected by loopback. In these files, use `module.exports` instead of the es6 `export`.
