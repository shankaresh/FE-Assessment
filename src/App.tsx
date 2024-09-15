import React, { useState, useEffect } from 'react';
import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Select,
  MenuItem,
  Dialog,
  Container,
  InputAdornment,
  Avatar,
  Box,
  Stack,
  Tooltip,
  IconButton,
  Grid2 as Grid,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from '@mui/material';
import { styled } from '@mui/system';
import { Add, CheckCircleOutline, Close, DeleteOutline, EditOutlined, HighlightOffOutlined, Search, Remove } from '@mui/icons-material';

interface Celebrity {
  id: number;
  first: string;
  last: string;
  dob: string;
  gender: string;
  email: string;
  picture: string;
  country: string;
  description: string;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: '1px solid #ccc',
  borderRadius: '12px',
  boxShadow: 'unset',
  ':before': {
    backgroundColor: 'unset',
  }
}));

const App: React.FC = () => {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<number | false>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedCelebrity, setEditedCelebrity] = useState<Celebrity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [celebrityToDelete, setCelebrityToDelete] = useState<number | null>(null);

  const stopPropagation = (event: React.MouseEvent<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement> | React.FocusEvent<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement>) => {
    event?.stopPropagation();
  };

  useEffect(() => {
    fetch('/celebrities.json')
      .then((response) => response.json())
      .then((data) => setCelebrities(data));
  }, []);

  const handleOpenAlert = (message: string) => {
    setOpenAlert(true);
    setAlertMessage(message);
  };
  
  const handleCloseAlert = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
    setAlertMessage("");
  };

  const handleAccordionChange = (id: number) => {
    if (!editingId) {
      setExpandedId(expandedId === id ? false : id);
    } else {
      handleOpenAlert('Finish editing before opening another accordion or closing current accordion');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCelebrities = celebrities.filter((celebrity) =>
    `${celebrity?.first} ${celebrity?.last}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleEdit = (celebrity: Celebrity) => {
    setEditingId(celebrity?.id);
    setEditedCelebrity({ ...celebrity });
  };

  const handleSave = () => {
    if (editedCelebrity) {
      const isEmptyField = Object.values(editedCelebrity).some(
        (value) => 
          value === null || 
          value === undefined || 
          (typeof value === "string" && value.trim() === "")
      );

      if (isEmptyField) {
        handleOpenAlert("All fields must be filled.");
        return;
      }
      
      setCelebrities(celebrities.map((c) => (c.id === editedCelebrity?.id ? editedCelebrity : c)));
      setEditingId(null);
      setEditedCelebrity(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedCelebrity(null);
  };

  const handleDelete = (id: number) => {
    setCelebrityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (celebrityToDelete) {
      setCelebrities(celebrities.filter((c) => c.id !== celebrityToDelete));
      setDeleteDialogOpen(false);
      setCelebrityToDelete(null);
    }
  };

  const handleClose = () => {
    setDeleteDialogOpen(false);
    setCelebrityToDelete(null);
  };

  const handleInputChange = (name: string, value: string) => {
    if (editedCelebrity) {
      if (name === 'country') {
        if (!/\d/.test(value)) { // Ensure no numbers in country field
          setEditedCelebrity({ ...editedCelebrity, [name]: value });
        } else {
          handleOpenAlert('Please avoid numbers in country field');
        }
      } else {
        setEditedCelebrity({ ...editedCelebrity, [name]: value });
      }
    }
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
        autoHideDuration={6000} 
        open={openAlert}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="error"
          // variant="outlined"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Container maxWidth="md" sx={{ my: 2 }}>
        <TextField
          fullWidth
          size='small'
          variant="outlined"
          placeholder="Search celebrities"
          value={searchTerm}
          onChange={handleSearch}
          slotProps={{
            input: {
              style:{
                borderRadius: '12px',
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          sx={{ 
            marginBottom: '20px',
          }}
        />
        {filteredCelebrities.map((celebrity) => (
          <StyledAccordion
            key={celebrity?.id}
            expanded={expandedId === celebrity?.id}
            onChange={() => handleAccordionChange(celebrity?.id)}
            disabled={expandedId !== celebrity?.id && (!!editingId)}
          >
            <AccordionSummary expandIcon={expandedId === celebrity?.id ?<Remove />:<Add />} sx={{ margin:0 }}>
              <Box display="flex" alignItems="center" width="100%" justifyContent="flex-start">
                <Avatar
                  src={celebrity?.picture}
                  alt={`${celebrity?.first} ${celebrity?.last}`}
                  sx={{ width: 40, height: 40, marginRight: 2, border: '1px solid #ccc'}}
                />
                {editingId === celebrity?.id ? (
                  <>
                    <TextField
                      name="first"
                      size='small'
                      label='first name'
                      value={editedCelebrity?.first ?? ''}
                      onFocus={stopPropagation}
                      onClick={stopPropagation}
                      onChange={(e) => handleInputChange('first', e?.target?.value)}
                      slotProps={{
                        input: {
                          style:{
                            borderRadius: '12px',
                            marginRight: '10px',
                          },
                        },
                      }}
                    />
                    <TextField
                      name="last"
                      size='small'
                      label='last name'
                      value={editedCelebrity?.last ?? ''}
                      onFocus={stopPropagation}
                      onClick={stopPropagation}
                      onChange={(e) => handleInputChange('last', e?.target?.value)}
                      slotProps={{
                        input: {
                          style:{
                            borderRadius: '12px',
                          },
                        },
                      }}
                    />
                  </>
                ):(
                  <Typography>{`${celebrity?.first} ${celebrity?.last}`}</Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Stack direction={'column'}>
                    <Typography style={{ color:'#999' }}>Age</Typography>
                    {editingId === celebrity?.id ? (
                      <TextField
                        fullWidth
                        name="dob"
                        type='date'
                        size='small'
                        value={editedCelebrity?.dob ?? ''}
                        onChange={(e) => handleInputChange('dob', e?.target?.value)}
                        slotProps={{
                          input: {
                            style:{
                              borderRadius: '12px',
                            },
                          },
                        }}
                      />
                    ):(
                      <Typography>{calculateAge(celebrity?.dob)}</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack direction={'column'}>
                    <Typography style={{ color:'#999' }}>Gender</Typography>
                    {editingId === celebrity?.id ? (
                      <Select
                        fullWidth
                        name="gender"
                        size='small'
                        value={editedCelebrity?.gender ?? ''}
                        onChange={(e) => handleInputChange('gender', e?.target?.value)}
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="transgender">Transgender</MenuItem>
                        <MenuItem value="rather not say">Rather not say</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    ):(
                      <Typography>{celebrity?.gender}</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack direction={'column'}>
                    <Typography style={{ color:'#999' }}>Country</Typography>
                    {editingId === celebrity?.id ? (
                      <TextField
                        fullWidth
                        name="country"
                        size='small'
                        value={editedCelebrity?.country ?? ''}
                        onChange={(e) => handleInputChange('country', e?.target?.value)}
                        slotProps={{
                          input: {
                            style:{
                              borderRadius: '12px',
                            },
                          },
                        }}
                      />
                    ):(
                      <Typography>{celebrity?.country}</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack direction={'column'}>
                    <Typography style={{ color:'#999' }}>Description</Typography>
                    {editingId === celebrity?.id ? (
                      <TextField
                        fullWidth
                        name="description"
                        size='small'
                        multiline
                        rows={4}
                        value={editedCelebrity?.description ?? ''}
                        onChange={(e) => handleInputChange('description', e?.target?.value)}
                        slotProps={{
                          input: {
                            style:{
                              borderRadius: '12px',
                            },
                          },
                        }}
                      />
                    ):(
                      <Typography>{celebrity?.description}</Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack direction={'row'} justifyContent={'flex-end'}>
                    {editingId === celebrity?.id ? (
                      <>
                        <Tooltip title="Cancel" placement="top" arrow>
                          <span>
                            <IconButton
                              onClick={handleCancel}
                              color='error'
                            >
                              <HighlightOffOutlined />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Save" placement="top" arrow>
                          <span>
                            <IconButton
                              onClick={handleSave} 
                              disabled={JSON.stringify(editedCelebrity) === JSON.stringify(celebrity)}
                              color='success'
                            >
                              <CheckCircleOutline />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ):(
                      <>
                        <Tooltip title="Delete" placement="top" arrow>
                          <span>
                            <IconButton
                              onClick={() => handleDelete(celebrity?.id)}
                              disabled={calculateAge(celebrity?.dob) < 18}
                              color='error'
                            >
                              <DeleteOutline />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Edit" placement="top" arrow>
                          <span>
                            <IconButton
                              onClick={() => handleEdit(celebrity)}
                              disabled={calculateAge(celebrity?.dob) < 18}
                              color='primary'
                            >
                              <EditOutlined />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </AccordionDetails>
          </StyledAccordion>
        ))}

        {/* delete confirmation */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={handleClose}
          // fullWidth
          maxWidth={'sm'}
          PaperProps={{
            style: {
              borderRadius:'14px'
            }
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
          <Box style={{ padding:'1.5rem' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography>Are you sure you want to delete?</Typography>
              </Grid>
              <Grid size={12}>
                <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
                  <Button 
                    onClick={handleClose}
                    variant='outlined'
                    color='inherit'
                    sx={{ 
                      textTransform: 'capitalize',
                      px: '2rem',
                      borderRadius: '14px'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmDelete}
                    variant='contained'
                    sx={{
                      backgroundColor: "#ff3500",
                      textTransform: 'capitalize',
                      px: '2rem',
                      borderRadius: '14px' 
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
};

export default App;