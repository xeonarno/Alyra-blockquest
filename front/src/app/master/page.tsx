"use client"

import TeamAdd from '@/component/TeamAdd/TeamAdd';
import TeamCard from '@/component/TeamCard/TeamCard';
import {
  Box, Container,
  Flex,
  Heading, Stack,
  Text
} from '@chakra-ui/react';
import { ReactElement, use, useCallback, useEffect, useState } from 'react';
import { useTeamEvent, useTeamGetTeamsOfGm } from "@/context/contract/API";
import { useAccount } from 'wagmi';

interface CardProps {
    heading: string;
    description: string;
    icon: ReactElement;
    href: string;
}

//   const Card = ({ heading, description, icon, href }: CardProps) => {
//     return (
//       <Box
//         maxW={{ base: 'full', md: '275px' }}
//         w={'full'}
//         borderWidth="1px"
//         borderRadius="lg"
//         overflow="hidden"
//         p={5}>
//         <Stack align={'start'} spacing={2}>
//           <Flex
//             w={16}
//             h={16}
//             align={'center'}
//             justify={'center'}
//             color={'white'}
//             rounded={'full'}
//             bg={useColorModeValue('gray.100', 'gray.700')}>
//             {icon}
//           </Flex>
//           <Box mt={2}>
//             <Heading size="md">{heading}</Heading>
//             <Text mt={1} fontSize={'sm'}>
//               {description}
//             </Text>
//           </Box>
//           <Button variant={'link'} colorScheme={'blue'} size={'sm'}>
//             Learn more
//           </Button>
//         </Stack>
//       </Box>
//     );
//   };

export default function Master() {

  const { address } = useAccount(); 
  const { data, isSuccess, isError } = useTeamGetTeamsOfGm({ args: [address as any] });

  const [teams, setTeams] = useState<any[]>([]);

    const handleValidation = useCallback(() => {
      
    }, []);

    useEffect(() => {
      if(isSuccess) {
        console.log(data);

        setTeams([...teams, ...data])
      }
    }, [isSuccess, data]);

    
    return (
     
            <Box p={4}>
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
                    <Heading fontSize={{ base: '2xl', sm: '4xl' }} fontWeight={'bold'}>
                        Teams Management <TeamAdd question="Team" onNext={() =>  handleValidation()} />
                    </Heading>
                    <Text color={'gray.600'} fontSize={{ base: 'sm', sm: 'lg' }}>
                        Here is the list of your teams and the possibility to create new ones.
                    </Text>
                </Stack>

                <Container maxW={'5xl'} mt={12}>
                    <Flex flexWrap="wrap" gridGap={6} justify="center">
                        {
                          teams.map((team, i) => {
                            console.log(team);
                            return <TeamCard key={i} heading={''} icon={''} description={''} href={''} />
                          })
                          
                        }
                        <TeamCard heading={''} icon={''} description={''} href={''} />
                    </Flex>
                </Container>
            </Box>
  
    );
}