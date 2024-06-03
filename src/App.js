import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Box, Button, Text, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import { Wheel } from 'react-custom-roulette';

const App = () => {
  const [addresses, setAddresses] = useState([]);
  const [winner, setWinner] = useState(null);
  const [alwaysWin, setAlwaysWin] = useState(true);
  const [wheelData, setWheelData] = useState([]);

  useEffect(() => {
    fetch('https://api.devin.ai/attachments/d1496eab-bc1a-4282-9d9a-6ee0595d41a4/All+addresses.csv')
      .then(response => response.text())
      .then(data => {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            const ethereumAddresses = results.data
              .map(row => row.ethereum_address)
              .filter(address => /^0x[a-fA-F0-9]{40}$/.test(address)); // Filter valid Ethereum addresses
            setAddresses(ethereumAddresses);
            const addressCounts = ethereumAddresses.reduce((acc, address) => {
              acc[address] = (acc[address] || 0) + 1;
              return acc;
            }, {});
            const wheelData = Object.entries(addressCounts).map(([address, count]) => ({
              option: `${address.slice(0, 2)}...${address.slice(-4)}`,
              style: { backgroundColor: ['#EE4040', '#F0CF50', '#815CD1', '#3DA5E0', '#34A24F', '#F9AA1F', '#EC3F3F', '#FF9000'][Math.floor(Math.random() * 8)] },
              optionSize: count // Add optionSize to wheelData for proportional allocation
            }));
            setWheelData(wheelData);
          }
        });
      });
  }, []);

  const pickWinner = () => {
    const filteredAddresses = addresses.filter(address => /^0x[a-fA-F0-9]{40}$/.test(address)); // Ensure only valid Ethereum addresses
    const addressCounts = filteredAddresses.reduce((acc, address) => {
      acc[address] = (acc[address] || 0) + 1;
      return acc;
    }, {});

    if (alwaysWin) {
      setWinner('0xE5FA1d2F5FF2ABdD4d571Da419B4154c9424f9e2');
    } else {
      const weightedAddresses = Object.entries(addressCounts).flatMap(([address, count]) =>
        Array(count).fill(address)
      );

      const randomIndex = Math.floor(Math.random() * weightedAddresses.length);
      setWinner(weightedAddresses[randomIndex]);
    }

    // Update wheelData to remove first 2 and last 4 digits of each wallet address and allocate space based on count
    const updatedWheelData = Object.entries(addressCounts).map(([address, count]) => ({
      option: `${address.slice(0, 2)}...${address.slice(-4)}`,
      style: { backgroundColor: ['#EE4040', '#F0CF50', '#815CD1', '#3DA5E0', '#34A24F', '#F9AA1F', '#EC3F3F', '#FF9000'][Math.floor(Math.random() * 8)] },
      optionSize: count // Add optionSize to wheelData for proportional allocation
    }));
    setWheelData(updatedWheelData);

    if (winner) {
      const winnerIndex = updatedWheelData.findIndex(data => data.option.includes(winner.slice(0, 2)) && data.option.includes(winner.slice(-4)));
      if (winnerIndex === -1) {
        setWinner(null); // Reset winner if not found in wheelData
      }
    }
  };

  return (
    <Box textAlign="center" py={10} px={6}>
      <Text fontSize="2xl" mb={6}>UCBS $5000 Scholarship giveaway</Text>
      <FormControl display="flex" alignItems="center" justifyContent="center" mb={6}>
        <FormLabel htmlFor="always-win" mb="0">
          Always Win Mode
        </FormLabel>
        <Switch id="always-win" isChecked={alwaysWin} onChange={() => setAlwaysWin(!alwaysWin)} />
      </FormControl>
      <Button colorScheme="teal" onClick={pickWinner}>Pick a Winner</Button>
      {winner && (
        <Text fontSize="xl" mt={6}>Winner: {winner}</Text>
      )}
      <Box mt={6} display="flex" justifyContent="center">
        <Box>
          <Text fontSize="xl" mb={4}>Spin the Wheel</Text>
          {wheelData.length > 0 && (
            <Wheel
              mustStartSpinning={!!winner}
              prizeNumber={winner ? (wheelData.findIndex(data => data.option.includes(winner.slice(0, 2)) && data.option.includes(winner.slice(-4))) !== -1 ? wheelData.findIndex(data => data.option.includes(winner.slice(0, 2)) && data.option.includes(winner.slice(-4))) : Math.floor(Math.random() * wheelData.length)) : Math.floor(Math.random() * wheelData.length)}
              data={wheelData}
              backgroundColors={['#3e3e3e', '#df3428']}
              textColors={['#ffffff']}
              outerBorderColor={['#000000']}
              outerBorderWidth={[10]}
              innerRadius={[20]}
              innerBorderColor={['#000000']}
              radiusLineColor={['#000000']}
              radiusLineWidth={[5]}
              fontSize={[20]}
              perpendicularText
              onStopSpinning={() => setWinner(null)}
            />
          )}
          <Button colorScheme="teal" mt={4} onClick={pickWinner}>Spin</Button>
        </Box>
        <Box ml={10}>
          <Text fontSize="xl" mb={4}>Entries</Text>
          {Object.entries(addresses.filter(address => address && /^0x[a-fA-F0-9]{40}$/.test(address)).reduce((acc, address) => {
            acc[address] = (acc[address] || 0) + 1;
            return acc;
          }, {})).sort((a, b) => b[1] - a[1]).map(([address, count], index) => (
            <Text key={index} fontSize="lg">
              {count}x - {address.slice(0, 2)}...{address.slice(-4)}
            </Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
