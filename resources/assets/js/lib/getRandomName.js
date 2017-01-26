import sample from 'lodash/sample'

const firstNames = ['Ranger', 'Real Estate', 'Slim', 'Tree Hugger', 'Mad', 'Sarcastic', 'Cactus', 'Deadeye', 'Pale Face', 'Texas', 'Horseface', 'Crazy', 'Cotton Mouth', 'Whiskey', '3 Fingers', 'Ace', 'Amarillo', 'Apache', 'Bearcat', 'Bitter Creek', 'Black', 'Black Rock', 'Blackjack', 'Bloody', 'Blueridge', 'Brawney', 'Bronco', 'Buck', 'Buckskin', 'Buffalo', 'Bull', 'Bushwack', 'Cajun', 'Captain', 'Cheerful', 'Cherokee', 'Cheyenne', 'Colonel', 'Coonskin', 'Dakota', 'Dead Eye', 'Deadwood', 'Digger', 'Dirty', 'Durango', 'Frontier', 'Gentleman', 'Gravedigger', 'Gunner', 'Hole Card', 'Hoodoo', 'Joker', 'Lawless', 'Lightning', 'Loco', 'Lucky', 'Major', 'Mustang', 'Natchez', 'Navajo', 'Nevada', 'Nightrider', 'One-Eyed', 'Pecos', 'Preacher', 'Rattlesnake', 'Rawhide', 'Red', 'Reno', 'Reverend', 'Riverboat', 'English', 'Insane', 'Shotgun', 'Sweaty', 'Sideways', 'Sidewinder', 'Six Gun', 'Skull', 'Slaughter', 'Slick', 'Slippery', 'Smiley', 'Smokey', 'Snake-bite', 'Snake-eyes', 'Stone River', 'Stumpy', 'Three Rivers', 'Tombstone', 'Trapper', 'Two Gun', 'Ugly', 'Waco', 'Whip', 'Whiskey', 'Whitey', 'Wichitaw', 'Wild', 'Trigger Finger', 'Lead Engineer', 'Waterfall', 'Black', 'Milktoast', 'Dogface', 'Grunt', 'Leatherneck', 'Rebel', 'Stealthy', 'Flasher', 'Nasty', 'Frantic', 'Armored', 'Noob', 'Commando', 'Ninja', 'Silver', 'Salty', 'Wrecker', 'Frenzied']
const lastNames = ['Rick', 'Steve', 'Andrew', 'Mike', 'Jim', 'James', 'Josh', 'Nick', 'Rob', 'John', 'Luke']

export default function () {
  return sample(firstNames) + ' ' + sample(lastNames)
}
