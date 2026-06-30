import { Flex, Popover, UnstyledButton, Text, Anchor } from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";

export default function OrcidInfo({size}: {size: string}) {  
  return (
    <Popover width='200' position='top' shadow='xs'>
      <Popover.Target>
        <UnstyledButton variant='none' bdrs='100'>
          <Flex>
            <IconHelp size={size} stroke='1' color='var(--mantine-color-dimmed)'/>  
          </Flex>
        </UnstyledButton>  
      </Popover.Target>  
      <Popover.Dropdown 
        bdrs='md' 
        bd='1px solid navy.2'
        styles={{
          arrow: {
            border: '1px solid var(--mantine-color-navy-2)'
          }
        }}
      >
        <Text fz='xs'>
          An <Text component='span' fz='xs' fw='600'>ORCID iD </Text> 
          is a unique identifier researchers can use to link all of your 
          research with you. Linking your account with an ORCID iD will
          enable LabScity to automatically fetch data about your 
          publications. 
        </Text>
        <Anchor fz='xs' href='https://info.orcid.org/researchers/' target="_blank" rel="noopener noreferrer">
          Learn more at orcid.org
        </Anchor>
      </Popover.Dropdown>
    </Popover>
  )
}