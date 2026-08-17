// Small nationality-flavoured name banks used to generate filler squad players.
export const NAME_BANKS = {
  Brazil: { first: ['Gabriel', 'Lucas', 'Matheus', 'Rafael', 'Bruno', 'Thiago', 'Caio'], last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida'] },
  Argentina: { first: ['Mateo', 'Franco', 'Nicolas', 'Ezequiel', 'Santiago', 'Lautaro', 'Agustin'], last: ['Gonzalez', 'Rodriguez', 'Fernandez', 'Diaz', 'Romero', 'Alvarez', 'Molina'] },
  Portugal: { first: ['Joao', 'Rui', 'Diogo', 'Tiago', 'Goncalo', 'Bruno', 'Pedro'], last: ['Silva', 'Ferreira', 'Costa', 'Martins', 'Carvalho', 'Pinto', 'Lopes'] },
  France: { first: ['Antoine', 'Lucas', 'Hugo', 'Theo', 'Nathan', 'Enzo', 'Adrien'], last: ['Bernard', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Girard', 'Roux'] },
  Norway: { first: ['Martin', 'Sander', 'Jonas', 'Henrik', 'Kristian', 'Magnus', 'Oskar'], last: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Berg'] },
  England: { first: ['Jack', 'Harry', 'George', 'Charlie', 'James', 'Oliver', 'Callum'], last: ['Smith', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Walker', 'Foster'] },
  Egypt: { first: ['Ahmed', 'Mahmoud', 'Omar', 'Youssef', 'Karim', 'Amr', 'Hassan'], last: ['El-Sayed', 'Farouk', 'Mostafa', 'Hassan', 'Ibrahim', 'Fathy', 'Adel'] },
  Spain: { first: ['Alvaro', 'Pablo', 'Sergio', 'Diego', 'Marc', 'Adrian', 'Hugo'], last: ['Garcia', 'Martinez', 'Lopez', 'Sanchez', 'Perez', 'Torres', 'Ramos'] },
  Germany: { first: ['Lukas', 'Finn', 'Jonas', 'Maximilian', 'Paul', 'Felix', 'Leon'], last: ['Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker'] },
  Netherlands: { first: ['Daan', 'Sem', 'Lars', 'Bram', 'Milan', 'Thijs', 'Ruben'], last: ['de Jong', 'Bakker', 'Visser', 'Smit', 'Meijer', 'Jansen', 'de Boer'] },
  Italy: { first: ['Marco', 'Luca', 'Matteo', 'Alessandro', 'Davide', 'Francesco', 'Andrea'], last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo'] },
  Belgium: { first: ['Louis', 'Arthur', 'Noah', 'Lucas', 'Victor', 'Milo', 'Gaspard'], last: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Willems', 'Claes', 'Goossens'] },
  Croatia: { first: ['Ivan', 'Marko', 'Luka', 'Ante', 'Josip', 'Filip', 'Petar'], last: ['Horvat', 'Kovacic', 'Babic', 'Maric', 'Juric', 'Novak', 'Vukovic'] },
  Morocco: { first: ['Yassine', 'Mehdi', 'Adam', 'Zakaria', 'Anas', 'Ilyas', 'Rayan'], last: ['El Amrani', 'Benali', 'Chakir', 'Idrissi', 'Ziani', 'Bouzid', 'Fassi'] },
  Uruguay: { first: ['Diego', 'Facundo', 'Nicolas', 'Federico', 'Rodrigo', 'Bruno', 'Sebastian'], last: ['Perez', 'Fernandez', 'Rodriguez', 'Silva', 'Suarez', 'Cabrera', 'Nunez'] },
  Japan: { first: ['Haruto', 'Yuto', 'Sota', 'Ren', 'Riku', 'Kaito', 'Sho'], last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'] },
  Default: { first: ['Alex', 'Sam', 'Chris', 'Jordan', 'Kai', 'Robin', 'Casey'], last: ['Reyes', 'Novak', 'Kane', 'Fox', 'Hart', 'Vega', 'Stone'] },
};

let seedCounter = 1;
export function generateName(nationality) {
  const bank = NAME_BANKS[nationality] || NAME_BANKS.Default;
  const first = bank.first[Math.floor(Math.random() * bank.first.length)];
  const last = bank.last[Math.floor(Math.random() * bank.last.length)];
  seedCounter++;
  return `${first} ${last}`;
}

export const NATIONALITIES = [
  'Brazil', 'Argentina', 'Portugal', 'France', 'Norway', 'England', 'Egypt', 'Spain',
  'Germany', 'Netherlands', 'Italy', 'Belgium', 'Croatia', 'Morocco', 'Uruguay', 'Japan',
  'United States', 'Nigeria', 'Ghana', 'Senegal', 'South Korea', 'Mexico', 'Colombia', 'Wales',
  'Scotland', 'Ireland', 'Poland', 'Sweden', 'Denmark', 'Switzerland', 'Austria', 'Serbia',
  'Canada', 'Australia', 'Chile', 'Ecuador', 'Turkey', 'Greece', 'Ukraine', 'Algeria',
];
