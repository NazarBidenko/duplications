import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  ViewList, 
  ViewStream, 
  ContentPaste, 
  ContentCopy 
} from '@mui/icons-material';

interface UrlItem {
  url: string;
  isUsed: boolean;
}

function App() {
  const [input, setInput] = useState<string>('');
  const [urlItems, setUrlItems] = useState<UrlItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'text'>('table');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyFormat, setCopyFormat] = useState<'compact' | 'spaced'>('compact');

  const removeDuplicateUrls = (text: string) => {
    const lines = text.split(/[\n\s]+/);
    
    const uniqueUrls = new Set(
      lines.filter(line => {
        try {
          const url = new URL(line);
          url.search = '';
          return url.toString();
        } catch {
          return false;
        }
      }).map(url => {
        // Видаляємо всі параметри після знаку питання та слеш в кінці
        return url.split('?')[0].replace(/\/$/, '');
      })
    );
    
    return Array.from(uniqueUrls).map(url => ({
      url,
      isUsed: false
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      // Додаємо штучну затримку для демонстрації лоадера
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cleanedUrls = removeDuplicateUrls(input);
      setUrlItems(cleanedUrls);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckboxChange = (index: number) => {
    setUrlItems(prevItems => 
      prevItems.map((item, i) => 
        i === index ? { ...item, isUsed: !item.isUsed } : item
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setUrlItems(prevItems => 
      prevItems.map(item => ({ ...item, isUsed: checked }))
    );
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'table' | 'text' | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleCopy = async () => {
    try {
      const separator = copyFormat === 'compact' ? '\n' : '\n\n';
      const textToCopy = viewMode === 'table' 
        ? urlItems.map(item => `${item.isUsed ? '✅' : '❌'} ${item.url}`).join(separator)
        : urlItems.map(item => item.url).join(separator);
      
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderTextOutput = () => (
    <TextField
      value={urlItems.map(item => item.url).join(copyFormat === 'compact' ? '\n' : '\n\n')}
      multiline
      rows={10}
      fullWidth
      InputProps={{
        readOnly: true,
        sx: { fontFamily: 'monospace', bgcolor: 'white' }
      }}
      placeholder="Результат буде тут"
    />
  );

  const renderTableOutput = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={urlItems.some(item => item.isUsed) && !urlItems.every(item => item.isUsed)}
                checked={urlItems.length > 0 && urlItems.every(item => item.isUsed)}
                onChange={(event) => handleSelectAll(event.target.checked)}
              />
            </TableCell>
            <TableCell>URL</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {urlItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={item.isUsed}
                  onChange={() => handleCheckboxChange(index)}
                />
              </TableCell>
              <TableCell>
                <Typography
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {item.url}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ 
      bgcolor: '#1a365d',
      minHeight: '100vh',
      py: 3,
      color: 'white'
    }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              URL Duplicates Remover
            </Typography>
            <Tooltip title="Вставити з буфера обміну">
              <IconButton 
                onClick={handlePaste}
                sx={{ color: 'white' }}
              >
                <ContentPaste />
              </IconButton>
            </Tooltip>
          </Box>
          
          <TextField
            value={input}
            onChange={handleInputChange}
            multiline
            rows={10}
            fullWidth
            placeholder="Вставте список URL (кожне посилання з нового рядка або через пробіл)"
            InputProps={{
              sx: { 
                fontFamily: 'monospace',
                bgcolor: 'white'
              }
            }}
          />

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <LoadingButton 
                loading={isProcessing}
                variant="contained" 
                onClick={handleSubmit}
                sx={{ 
                  minWidth: 200,
                  bgcolor: '#4299e1',
                  '&:hover': {
                    bgcolor: '#2b6cb0'
                  }
                }}
                >
                  Видалити дублікати
                </LoadingButton>
              
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                sx={{ 
                  bgcolor: 'white',
                  '& .Mui-selected': {
                    bgcolor: '#4299e1 !important',
                    color: 'white !important'
                  }
                }}
              >
                <ToggleButton value="table" aria-label="table view">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="text" aria-label="text view">
                  <ViewStream />
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                  value={copyFormat}
                  exclusive
                  onChange={(_event, newFormat) => {
                    if (newFormat !== null) {
                      setCopyFormat(newFormat);
                    }
                  }}
                  aria-label="copy format"
                  sx={{ 
                    bgcolor: 'white',
                    '& .Mui-selected': {
                      bgcolor: '#4299e1 !important',
                      color: 'white !important'
                    }
                  }}
                >
                  <ToggleButton value="compact" aria-label="compact format">
                    <Tooltip title="Компактний формат">
                      <Box sx={{ px: 1 }}>Компактний</Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="spaced" aria-label="spaced format">
                    <Tooltip title="З пропусками">
                      <Box sx={{ px: 1 }}>З пропусками</Box>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {urlItems.length > 0 && (
              <Tooltip title="Скопіювати результат">
                <IconButton 
                  onClick={handleCopy}
                  sx={{ color: 'white' }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {urlItems.length > 0 && (
            viewMode === 'table' ? renderTableOutput() : renderTextOutput()
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
