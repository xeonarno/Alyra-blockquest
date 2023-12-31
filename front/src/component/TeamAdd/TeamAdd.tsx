"use client";

import { AddIcon } from "@chakra-ui/icons";
import { Button, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Input, FormControl, FormLabel, useDisclosure, Textarea } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAccount } from "wagmi";


import { useGameMasterCreateTeam } from "@/context/contract/API";
import { useEffect } from "react";

type FormData = {
    teamName: string;
    gameMasterAddress: string;
    imageURL: string;
    description: string;
};

type AdminValidation = { question: string, onNext: Function };

export default function TeamAdd({ question, onNext }: AdminValidation) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { isConnected, address } = useAccount();  // Assuming useAccount hook is accessible

    const { data , write, isSuccess, isError } = useGameMasterCreateTeam();

    useEffect(() => {
        onNext();
        onClose();
    }, [isSuccess]);

    const handleConfirm : SubmitHandler<any> = async (data: any) => {
        console.log(data); // Log the form data, replace this with your own logic

        await write({ args: [data.teamName, data.imageURL, data.description] })
    
    }

    return (
        <>
            <Button
                rightIcon={<AddIcon />}
                onClick={onOpen}
                colorScheme='blue' variant='solid'>
                new Team
            </Button>

            <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent as="form" onSubmit={handleSubmit(handleConfirm)}>
                    <ModalHeader>{question}</ModalHeader>
                    <ModalCloseButton />
                    <FormControl isInvalid={!!errors.teamName}>
                        <FormLabel htmlFor="teamName">Team Name</FormLabel>
                        <Input id="teamName" {...register("teamName", { required: true })} />
                    </FormControl>
                    <Input type="hidden" {...register("gameMasterAddress", { value: isConnected ? address : "" })} />
                    <FormControl isInvalid={!!errors.imageURL}>
                        <FormLabel htmlFor="imageURL">Image URL</FormLabel>
                        <Input id="imageURL" {...register("imageURL", { required: true })} />
                    </FormControl>
                    <FormControl isInvalid={!!errors.description}>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <Textarea id="description" {...register("description", { required: true, maxLength: 150 })} />
                    </FormControl>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} type="submit">
                            Confirm
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
