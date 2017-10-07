const fs = require('fs')
const exec = require('child_process').execFileSync
const readline = require('readline-sync')

const path = __dirname + '/package.json'

const config = [
  {
    label: 'Package name',
    get: package => package.name,
    set: (value, package) => { package.name = value }
  },
  {
    label: 'Author',
    get: package => package.author,
    set: (value, package) => { package.author = value }
  },
  {
    label: 'Github username',
    get: package => package.repository.url.replace(/^https:\/\/www\.github\.com\/([^\/]+)\/.+$/, '$1'),
    set: (value, package) => { package.repository.url = 'https://www.github.com/' + value + '/' + package.name }
  }
]

fs.readFile(path, (err, package) => {
  package = JSON.parse(package)

  config.forEach(property => {
    var value = readline.question(property.label + ' (' + property.get(package) + '): ')
    property.set(value.trim() || property.get(package), package)
  })

  delete package.scripts.init

  fs.writeFile(path, JSON.stringify(package, null, 2), () => {
    console.log('Removing initialization script...')
    fs.unlink(__dirname + '/init.js', () => {

      console.log('Removing git directory...')
      fs.unlink(__dirname + '/.git', () => {

        console.log('Initializing git...')
        exec('git', ['init'])

        console.log('Removing initialization dependencies...')
        exec('npm', ['uninstall', '--save-dev', 'readline-sync'])

        fs.writeFile(__dirname + '/README.md', '# '+package.name, () => {

          console.log('Renaming package directory...')
          fs.rename(__dirname, __dirname.replace(/\/[^\/]+$/, '/' + package.name), () => {
            console.log('Finished initialization')
          })
        })
      })
    })
  })
})
