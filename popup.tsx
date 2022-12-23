import {
  Button,
  Collapse,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
  UnstyledButton,
  createStyles,
  useMantineTheme
} from "@mantine/core"
import { IconCheck, IconExternalLink, IconX } from "@tabler/icons"
import katipunero from "data-base64:~assets/katipunero.png"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage"

import { storage } from "~contents/cedula"

import { version } from "./package.json"

const useStyles = createStyles((theme) => ({
  card: {
    height: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },

  title: {
    fontFamily: `Greycliff CF ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.black,
    lineHeight: 1.2,
    fontSize: 32,
    marginTop: theme.spacing.xs
  },

  category: {
    color: theme.black,
    opacity: 0.7,
    fontWeight: 700,
    textTransform: "uppercase"
  }
}))

function IndexPopup() {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const [opened, setOpened] = useState(false)
  const [markAllChecked, setMarkAllChecked] = useStorage(
    { key: "markAll", area: "local" },
    "false"
  )
  const clearStorage = () => {
    chrome.storage.local.clear()
    console.log("cleared storage")
    refresh()
  }

  const switchPreview = (event: { currentTarget: { checked: any } }) => {
    setMarkAllChecked(event.currentTarget.checked ? "true" : "false")
    refresh()
  }

  const refresh = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: tabs[0].url })
    })
  }

  return (
    <Stack
      sx={{
        padding: 15,
        width: 150
      }}>
      <Text
        component="span"
        align="center"
        variant="gradient"
        gradient={{ from: "indigo", to: "cyan", deg: 45 }}
        size="xl"
        weight={700}
        style={{ fontFamily: "Greycliff CF, sans-serif" }}>
        Cedula {version}
      </Text>
      <Switch
        checked={markAllChecked === "true"}
        onChange={switchPreview}
        color="teal"
        size="sm"
        label="Preview badges on everyone"
        thumbIcon={
          markAllChecked === "true" ? (
            <IconCheck
              size={12}
              color={theme.colors.teal[theme.fn.primaryShade()]}
              stroke={3}
            />
          ) : (
            <IconX
              size={12}
              color={theme.colors.red[theme.fn.primaryShade()]}
              stroke={3}
            />
          )
        }
      />
      <UnstyledButton
        component="a"
        target="_blank"
        rel="noopener noreferrer"
        href={process.env.CEDULA_LANDING_URL}>
        <Paper
          p="xl"
          radius="md"
          sx={{
            backgroundImage: `url(${katipunero})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat"
          }}
          className={classes.card}></Paper>
      </UnstyledButton>
      <Button
        component="a"
        target="_blank"
        rel="noopener noreferrer"
        href={process.env.CEDULA_LANDING_URL}
        variant="outline"
        leftIcon={<IconExternalLink size={14} />}>
        Join Cedula
      </Button>
      <UnstyledButton
        sx={{
          alignSelf: "center"
        }}
        onClick={() => setOpened((o) => !o)}>
        <Text size="xs">Developer Options</Text>
      </UnstyledButton>

      <Collapse
        in={opened}
        sx={{
          alignSelf: "center"
        }}>
        <Button
          onClick={() => clearStorage()}
          sx={{
            alignSelf: "center"
          }}>
          Clear storage
        </Button>
      </Collapse>
    </Stack>
  )
}

export default IndexPopup
