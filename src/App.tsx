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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import { Search } from '@mui/icons-material';

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
}));

const App: React.FC = () => {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | false>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedCelebrity, setEditedCelebrity] = useState<Celebrity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [celebrityToDelete, setCelebrityToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetch('/celebrities.json')
      .then((response) => response.json())
      .then((data) => setCelebrities(data));
  }, []);

  const handleAccordionChange = (id: number) => {
    setExpandedId(expandedId === id ? false : id);
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

  const handleInputChange = (name:string , value:string) => {
    if (editedCelebrity) {
      setEditedCelebrity({ ...editedCelebrity, [name]: value });
    }
  };

  return (
    <div>
      <Container maxWidth="md" sx={{ my:2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search celebrities"
          value={searchTerm}
          onChange={handleSearch}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          style={{ marginBottom: '20px', }}
        />
        {filteredCelebrities.map((celebrity) => (
          <StyledAccordion
            key={celebrity?.id}
            expanded={expandedId === celebrity?.id}
            onChange={() => handleAccordionChange(celebrity?.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <img src={celebrity?.picture} alt={`${celebrity?.first} ${celebrity?.last}`} style={{ marginRight: '10px' }} />
              <Typography>{`${celebrity?.first} ${celebrity?.last}`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {editingId === celebrity?.id ? (
                <>
                  <TextField
                    fullWidth
                    name="country"
                    label="Country"
                    value={editedCelebrity?.country ?? ''}
                    onChange={(e) => handleInputChange('country', e?.target?.value)}
                    style={{ marginBottom: '10px' }}
                  />
                  <Select
                    fullWidth
                    name="gender"
                    value={editedCelebrity?.gender ?? ''}
                    onChange={(e) => handleInputChange('gender', e?.target?.value)}
                    style={{ marginBottom: '10px' }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="transgender">Transgender</MenuItem>
                    <MenuItem value="rather not say">Rather not say</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={editedCelebrity?.description ?? ''}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                    style={{ marginBottom: '10px' }}
                  />
                  <Button onClick={handleSave} disabled={JSON.stringify(editedCelebrity) === JSON.stringify(celebrity)}>
                    Save
                  </Button>
                  <Button onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Typography>Age: {calculateAge(celebrity?.dob)}</Typography>
                  <Typography>Gender: {celebrity?.gender}</Typography>
                  <Typography>Country: {celebrity?.country}</Typography>
                  <Typography>Description: {celebrity?.description}</Typography>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(celebrity)}
                    disabled={calculateAge(celebrity?.dob) < 18}
                  >
                    Edit
                  </Button>
                  <Button startIcon={<DeleteIcon />} onClick={() => handleDelete(celebrity?.id)}>
                    Delete
                  </Button>
                </>
              )}
            </AccordionDetails>
          </StyledAccordion>
        ))}

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this celebrity?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default App;